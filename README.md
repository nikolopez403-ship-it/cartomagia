# Cartomagia 🃏✨

App educativa para aprender **magia con cartas** de forma didáctica y divertida.

- **Camino de niveles**: cada nivel es una técnica, un truco o una rutina, enseñada paso a paso con ilustraciones.
- **Práctica con cámara + IA**: la app enciende la cámara, graba tu práctica y la evalúa:
  - **Análisis de manos en el teléfono** (MediaPipe Hand Landmarker, sin internet): presencia de las manos, encuadre, estabilidad, actividad y fluidez del movimiento.
  - **Coach IA opcional** (Claude): revisa fotogramas clave del video según los criterios de la lección y da correcciones concretas.
- **Monedas y puntos**: al superar un nivel ganas monedas (y estrellas según tu puntuación) que puedes canjear en la **Tienda** por técnicas, trucos y rutinas avanzadas.

> Esta es una **beta**. El contenido de las lecciones es de ejemplo y se irá reemplazando por el definitivo.

## Descargar el APK

Cada push a `main` compila el APK automáticamente con GitHub Actions:

- **Releases** del repositorio → descarga `cartomagia-beta-N.apk`, o
- **Actions → Android APK →** el último run → artefacto `cartomagia-apk`.

En el teléfono, permite "instalar apps de origen desconocido" para instalarlo.

## Estructura

```
src/
  data/levels.js        ← contenido: niveles del camino y objetos de la tienda
  illustrations.js      ← ilustraciones SVG de cada paso (reemplazables por fotos)
  ai/handTracker.js     ← detección de manos (MediaPipe, en el dispositivo)
  ai/evaluator.js       ← métricas y puntuación local
  ai/coach.js           ← revisión visual con Claude (opcional)
  views/                ← pantallas: camino, lección, práctica, tienda, perfil
  state.js              ← progreso, monedas, compras (guardado en el dispositivo)
android/                ← proyecto nativo Capacitor
```

### Añadir una lección

Agrega un objeto en `LEVELS` (camino) o `SHOP_ITEMS` (tienda) en `src/data/levels.js`. Para los pasos puedes usar una escena de `illustrations.js` o una foto: coloca la imagen en `public/images/` y usa `image: 'images/mi-foto.jpg'`.

El bloque `practice` define cómo evalúa la IA: cuántas manos deben verse, la duración, el modo (`hold` para posiciones quietas, `motion` para movimientos) y los criterios que revisa el coach.

## Desarrollo

```bash
npm install
npm run dev            # abre la app en el navegador
npm run android:sync   # compila y copia la web al proyecto Android
```

Para compilar el APK localmente necesitas Android Studio / Android SDK 36 y JDK 21:

```bash
cd android && ./gradlew assembleDebug
```

## Coach IA (beta)

En **Perfil** se puede ingresar una clave de API de Anthropic para activar el coach. La clave se guarda solo en el dispositivo. **Para producción** las llamadas deben hacerse desde un backend propio que guarde la clave en el servidor (nunca dentro del APK).
