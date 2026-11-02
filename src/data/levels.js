// Contenido de la beta. Es contenido de EJEMPLO para probar la app:
// las técnicas, trucos y rutinas definitivas se irán cargando aquí.
//
// Cada lección:
//  - type: 'tecnica' | 'truco' | 'rutina'
//  - steps[].image: clave de escena (src/illustrations.js) o ruta a una foto en /public
//  - practice: parámetros que usa la IA para evaluar el video
//      hands: manos que deben verse (1 o 2)
//      seconds: duración de la grabación
//      mode: 'hold' (mantener posición estable) | 'motion' (movimiento continuo)
//      criteria: lo que el coach IA (Claude) revisa en los fotogramas

export const LEVELS = [
  {
    id: 'agarre-mecanico',
    type: 'tecnica',
    title: 'El agarre del mecánico',
    subtitle: 'La base de casi todo',
    difficulty: 1,
    reward: 40,
    intro:
      'Es la forma estándar de sostener la baraja en la mano izquierda. Un buen agarre te da control, seguridad y es el punto de partida de cientos de técnicas.',
    steps: [
      { title: 'Prepara la mano', text: 'Extiende la mano izquierda con la palma hacia arriba y los dedos relajados.', image: 'grip-1' },
      {
        title: 'Coloca la baraja',
        text: 'Pon la baraja cara abajo, ligeramente en diagonal sobre la palma. Los dedos medio, anular y meñique la rodean por el lado derecho.',
        image: 'grip-2',
        tip: 'La esquina inferior izquierda de la baraja descansa en la base del pulgar.',
      },
      {
        title: 'El índice arriba',
        text: 'Curva el dedo índice y apóyalo en el borde superior (el que apunta hacia adelante). Sirve de tope y de guía.',
        image: 'grip-3',
      },
      {
        title: 'Pulgar relajado',
        text: 'Apoya el pulgar sobre la baraja o en su borde izquierdo, sin apretar. La mano debe verse natural.',
        image: 'grip-4',
        tip: 'Si se te cansa la mano, estás apretando demasiado.',
      },
    ],
    practice: {
      instructions: 'Muestra a la cámara tu mano izquierda sujetando la baraja en agarre de mecánico. Mantenla quieta y natural durante la grabación.',
      hands: 1,
      seconds: 8,
      mode: 'hold',
      criteria: [
        'La baraja descansa en diagonal sobre la palma izquierda',
        'El dedo índice está en el borde superior de la baraja',
        'Los dedos medio, anular y meñique rodean el lado derecho',
        'La mano se ve relajada y estable',
      ],
    },
  },
  {
    id: 'mezcla-arriba',
    type: 'tecnica',
    title: 'Mezcla por arriba',
    subtitle: 'Overhand shuffle',
    difficulty: 1,
    reward: 50,
    intro: 'La mezcla más común del mundo. Dominarla con fluidez hace que todo lo demás parezca natural.',
    steps: [
      { title: 'Posición inicial', text: 'La mano derecha toma la baraja por los extremos, con el pulgar atrás y los dedos adelante. La izquierda espera debajo.', image: 'shuffle-1' },
      {
        title: 'Arrastra con el pulgar',
        text: 'Baja la baraja hacia la mano izquierda: el pulgar izquierdo presiona la carta de arriba y retiene un pequeño paquete al subir la derecha.',
        image: 'shuffle-2',
      },
      {
        title: 'Encuentra el ritmo',
        text: 'Repite el movimiento (bajar, arrastrar, subir) hasta pasar todas las cartas. Busca un ritmo constante y relajado.',
        image: 'shuffle-3',
        tip: 'Mejor lento y parejo que rápido y con cartas cayendo.',
      },
    ],
    practice: {
      instructions: 'Haz mezclas por arriba continuas, con ambas manos visibles para la cámara.',
      hands: 2,
      seconds: 10,
      mode: 'motion',
      criteria: [
        'Ambas manos participan: la derecha sostiene la baraja por los extremos',
        'El pulgar izquierdo arrastra pequeños paquetes',
        'El movimiento es rítmico y continuo',
        'No se caen cartas',
      ],
    },
  },
  {
    id: 'carta-clave',
    type: 'truco',
    title: 'La carta clave',
    subtitle: 'Tu primer truco de adivinación',
    difficulty: 1,
    reward: 60,
    intro: 'Un clásico que funciona solo: encontrarás la carta elegida por el espectador gracias a una carta que tú conoces en secreto.',
    steps: [
      { title: 'Memoriza la clave', text: 'Mientras mezclas, mira de reojo la carta de abajo de la baraja y recuérdala. Esa es tu carta clave.', image: 'key-1', tip: 'Hazlo con naturalidad, nunca te quedes mirando.' },
      { title: 'Elige y coloca', text: 'Pide que elijan una carta, la memoricen y la dejen encima de la baraja.', image: 'key-2' },
      { title: 'Que corten', text: 'Pide que corten la baraja y completen el corte. Tu clave queda justo encima de su carta.', image: 'key-3', tip: 'Pueden cortar varias veces: el orden relativo no cambia.' },
      { title: 'La revelación', text: 'Extiende las cartas cara arriba. La carta que está justo después de tu clave es la elegida. ¡Revélala con drama!', image: 'key-4' },
    ],
    practice: {
      instructions: 'Graba la secuencia completa: vistazo a la carta de abajo, carta encima, corte y extendido de cartas.',
      hands: 2,
      seconds: 15,
      mode: 'motion',
      criteria: [
        'Se mira la carta de abajo de forma disimulada',
        'La carta elegida se coloca encima y se corta la baraja',
        'Las cartas se extienden para encontrar la elegida',
        'La presentación es fluida',
      ],
    },
  },
  {
    id: 'doble-levantada',
    type: 'tecnica',
    title: 'El levantamiento doble',
    subtitle: 'Dos cartas que parecen una',
    difficulty: 2,
    reward: 80,
    intro: 'Una de las técnicas más poderosas: volteas dos cartas como si fueran una sola. Es la llave de decenas de trucos.',
    steps: [
      { title: 'Separa dos cartas', text: 'Con la baraja en agarre de mecánico, el pulgar derecho levanta discretamente las dos cartas de arriba por el borde trasero.', image: 'double-1', tip: 'Practica sintiendo el grosor de dos cartas, sin mirar.' },
      { title: 'Cuadra el bloque', text: 'Mantén las dos cartas perfectamente alineadas para que parezcan una sola.', image: 'double-2' },
      { title: 'Voltea y muestra', text: 'Voltea el bloque cara arriba sobre la baraja y muéstralo. Luego vuélvelo a voltear con la misma naturalidad.', image: 'double-3' },
    ],
    practice: {
      instructions: 'Realiza varios levantamientos dobles seguidos frente a la cámara. Que parezca que volteas una sola carta.',
      hands: 2,
      seconds: 12,
      mode: 'motion',
      criteria: [
        'Las dos cartas se voltean perfectamente alineadas',
        'No se ve la separación (no se nota que son dos)',
        'El movimiento es igual al de voltear una sola carta',
        'La baraja permanece en agarre de mecánico',
      ],
    },
  },
  {
    id: 'carta-ambiciosa',
    type: 'truco',
    title: 'La carta ambiciosa',
    subtitle: 'Versión inicial',
    difficulty: 2,
    reward: 100,
    intro: 'Una carta colocada en el centro de la baraja vuelve, una y otra vez, a la parte de arriba. Usa el levantamiento doble.',
    steps: [
      { title: 'Muestra la carta', text: 'Haz un levantamiento doble y muestra la carta (por ejemplo, el 8♥). Vuelve a voltear el bloque cara abajo.', image: 'amb-1' },
      { title: 'Al centro', text: 'Toma solo la carta de arriba (que no es el 8♥) y métela en el centro de la baraja, sin mostrarla.', image: 'amb-2' },
      { title: '¡Sube!', text: 'Haz un gesto mágico, chasquea los dedos y voltea la carta de arriba: ¡el 8♥ ha vuelto!', image: 'amb-3', tip: 'La pausa antes de revelar es parte del truco.' },
    ],
    practice: {
      instructions: 'Graba el truco completo: muestra la carta, métela en el centro y revela que sube.',
      hands: 2,
      seconds: 15,
      mode: 'motion',
      criteria: [
        'Se muestra la carta con un levantamiento doble limpio',
        'Se introduce una carta en el centro sin mostrarla',
        'La revelación final es clara',
        'El ritmo y la presentación son convincentes',
      ],
    },
  },
  {
    id: 'glide',
    type: 'tecnica',
    title: 'El deslizamiento',
    subtitle: 'Glide',
    difficulty: 3,
    reward: 120,
    intro: 'Aparentas sacar la carta de abajo, pero en realidad sacas la segunda. Ideal para forzajes y cambios.',
    steps: [
      { title: 'Agarre de arriba', text: 'Sujeta la baraja cara abajo con la mano izquierda desde arriba, de forma que la carta de abajo quede expuesta.', image: 'glide-1' },
      { title: 'Retrocede la carta', text: 'Con la yema del anular, desliza la carta de abajo un centímetro hacia atrás.', image: 'glide-2' },
      { title: 'Saca la segunda', text: 'Los dedos de la mano derecha sacan la carta que queda expuesta: la segunda desde abajo.', image: 'glide-3' },
    ],
    practice: {
      instructions: 'Realiza varios deslizamientos seguidos mostrando ambas manos a la cámara.',
      hands: 2,
      seconds: 12,
      mode: 'motion',
      criteria: [
        'La baraja se sostiene desde arriba con la izquierda',
        'El anular retrocede la carta de abajo',
        'La mano derecha extrae la segunda carta',
        'El movimiento se ve natural',
      ],
    },
  },
];

// Contenido avanzado que se compra con monedas en la Tienda.
export const SHOP_ITEMS = [
  {
    id: 'mezcla-hindu',
    type: 'tecnica',
    title: 'Mezcla hindú',
    subtitle: 'Elegante y versátil',
    difficulty: 2,
    price: 120,
    reward: 60,
    intro: 'Una mezcla vistosa que además permite controlar cartas. Muy usada para forzar una carta.',
    steps: [
      { title: 'Pellizca desde arriba', text: 'La derecha sostiene la baraja por los extremos; el pulgar y el medio izquierdos pellizcan un paquete de arriba.', image: 'hindu-1' },
      { title: 'Repite', text: 'La derecha se retira dejando ese paquete en la izquierda. Repite hasta terminar.', image: 'hindu-2' },
    ],
    practice: {
      instructions: 'Haz mezclas hindúes continuas con ambas manos visibles.',
      hands: 2,
      seconds: 10,
      mode: 'motion',
      criteria: ['Los paquetes se toman desde arriba', 'El movimiento es fluido y continuo', 'No se caen cartas'],
    },
  },
  {
    id: 'corte-charlier',
    type: 'tecnica',
    title: 'Corte a una mano',
    subtitle: 'Charlier',
    difficulty: 3,
    price: 200,
    reward: 90,
    intro: 'El corte de exhibición por excelencia: cortas la baraja usando solo una mano.',
    steps: [
      { title: 'En la yema de los dedos', text: 'Sostén la baraja con la punta de los dedos y el pulgar a los lados.', image: 'charlier-1' },
      { title: 'Deja caer la mitad', text: 'Afloja el pulgar para que caiga la mitad inferior; el índice la empuja hacia arriba.', image: 'charlier-2' },
      { title: 'Cierra el corte', text: 'La mitad superior cae sobre el índice y las mitades se cierran en orden inverso.', image: 'charlier-3' },
    ],
    practice: {
      instructions: 'Haz cortes a una mano seguidos. Solo una mano debe intervenir.',
      hands: 1,
      seconds: 10,
      mode: 'motion',
      criteria: ['Solo interviene una mano', 'La baraja se divide en dos mitades', 'Las mitades se intercambian y se cierra el corte'],
    },
  },
  {
    id: 'cuatro-reinas',
    type: 'rutina',
    title: 'Las cuatro reinas',
    subtitle: 'Rutina corta',
    difficulty: 3,
    price: 300,
    reward: 150,
    intro: 'Una rutina que combina lo aprendido: las cuatro reinas se pierden en la baraja y reaparecen arriba, una a una.',
    steps: [
      { title: 'Presenta', text: 'Muestra las cuatro reinas en abanico.', image: 'queens-1' },
      { title: 'Piérdelas', text: 'Coloca cada reina en distintos puntos de la baraja (usando un control para mantenerlas arriba).', image: 'queens-2' },
      { title: 'Reaparición', text: 'Con levantamientos dobles, haz que cada reina aparezca arriba una tras otra.', image: 'queens-3' },
    ],
    practice: {
      instructions: 'Graba la rutina completa de principio a fin.',
      hands: 2,
      seconds: 20,
      mode: 'motion',
      criteria: ['Se presentan las cuatro reinas', 'Se colocan en la baraja', 'Reaparecen arriba de forma clara', 'La rutina fluye sin pausas torpes'],
    },
  },
];

export const ALL_LESSONS = [...LEVELS, ...SHOP_ITEMS];
export const getLesson = (id) => ALL_LESSONS.find((l) => l.id === id);

export const TYPE_LABEL = { tecnica: 'Técnica', truco: 'Truco', rutina: 'Rutina' };
export const TYPE_ICON = { tecnica: '✋', truco: '🎩', rutina: '🎭' };

export const PASS_SCORE = 60;
export function starsFor(score) {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= PASS_SCORE) return 1;
  return 0;
}
