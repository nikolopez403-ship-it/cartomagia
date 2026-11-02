// Coach IA: envía fotogramas clave de la práctica a Claude para que revise la
// técnica visualmente y dé retroalimentación en español.
//
// BETA: la clave de API la ingresa el usuario en Perfil y se guarda solo en
// el dispositivo. Para producción, estas llamadas deben pasar por un backend
// propio que guarde la clave en el servidor.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';

const SCHEMA = {
  type: 'object',
  properties: {
    logrado: { type: 'boolean', description: 'Si la técnica se ejecuta correctamente en lo esencial' },
    puntuacion: { type: 'integer', description: 'Puntuación de 0 a 100' },
    aciertos: { type: 'array', items: { type: 'string' }, description: 'Lo que hace bien (máx. 3)' },
    mejoras: { type: 'array', items: { type: 'string' }, description: 'Correcciones concretas (máx. 3)' },
    comentario: { type: 'string', description: 'Mensaje breve y motivador para el alumno' },
  },
  required: ['logrado', 'puntuacion', 'aciertos', 'mejoras', 'comentario'],
  additionalProperties: false,
};

export async function reviewWithCoach({ apiKey, lesson, frames, localResult }) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const brief = [
    `Lección: ${lesson.title} (${lesson.type}).`,
    `Pasos:\n${lesson.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}`,
    `Criterios a evaluar:\n${lesson.practice.criteria.map((c) => `- ${c}`).join('\n')}`,
    `Análisis automático de las manos (referencia): puntuación ${localResult.score}/100; ${localResult.feedback.join(' ')}`,
    `A continuación tienes ${frames.length} fotogramas en orden cronológico de un video de práctica de ${Math.round(localResult.seconds)} s.`,
  ].join('\n\n');

  const content = [{ type: 'text', text: brief }];
  frames.forEach((data, i) => {
    content.push({ type: 'text', text: `Fotograma ${i + 1}:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } });
  });
  content.push({
    type: 'text',
    text: 'Evalúa la ejecución según los criterios. Sé honesto pero alentador. Si no se distingue bien la técnica en las imágenes, dilo y puntúa con prudencia.',
  });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    system:
      'Eres un profesor de cartomagia experto y paciente. Revisas fotogramas de alumnos practicando técnicas y trucos con cartas y das retroalimentación concreta y breve en español.',
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') throw new Error('El coach no pudo revisar este video.');
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Respuesta vacía del coach.');
  const data = JSON.parse(text);
  data.puntuacion = Math.max(0, Math.min(100, Math.round(data.puntuacion)));
  return data;
}

export function errorMessage(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Clave de API inválida. Revísala en Perfil.';
  if (err instanceof Anthropic.RateLimitError) return 'Demasiadas solicitudes. Intenta de nuevo en un momento.';
  if (err instanceof Anthropic.APIConnectionError) return 'Sin conexión con el coach IA.';
  if (err instanceof Anthropic.APIError) return `Error del coach IA (${err.status ?? 'desconocido'}).`;
  return err?.message || 'Error desconocido del coach IA.';
}
