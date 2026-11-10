# Cava 3D y estadísticas completas — Diseño

Fecha: 2026-11-10
Estado: borrador para aprobación

## 1. Intención

El usuario quiere, como en la app Oeni: ver su cava como estantes tridimensionales configurables (profundidad × ancho × pisos), ver estadísticas completas con gráfico circular y tarjetas de apogeo, y mantener la lista de vinos con sus cantidades. La cava 3D es una **vista alternativa** de Mi Cava, no un reemplazo: la lista sigue siendo la forma principal de trabajar.

## 2. Objetivos

- Cava 3D: estantes con botellas como cilindros SVG, coloreadas por tipo, apiladas en capas (pisos), numeradas por fila.
- Configuración de la cava: profundidad, ancho y pisos, editables desde Ajustes.
- Modo de relleno: por vino (botellas de un vino juntas) o por tipo (agrupadas por color).
- Estadísticas completas: gráfico circular de reparto por tipo en botellas, tarjetas de apogeo (Listo / Guardar / Pronto / Sin datos) con conteo y porcentaje, valor estimado y referencias.
- Botón "Ver cava 3D" en la pantalla Mi Cava, al lado del buscador.

## No objetivos (V1)

- Rotación, zoom o gestos 3D reales: la vista es un plano fijo frontal.
- Múltiples cavas (Oeni tiene varias): una sola cava.
- Fotos de etiquetas en la vista 3D.
- Animaciones de relleno o arrastrar botellas.

## 3. Restricciones

- Sin nuevas dependencias: SVG nativo, nada de Three.js.
- Bundle inicial sigue por debajo de 140 kB gzip.
- La cava 3D debe funcionar offline como todo lo demás.
- Token de color existente: `wine` #7A2233, `gold` #C2A369, fondo `bg` #0F0D0C.
- El esquema de datos no cambia: la cava 3D deriva de los vinos existentes; la configuración se guarda en `localStorage` con la clave `micava.cave`.

## 4. Enfoques

1. **SVG plano con capas numeradas** (elegido): cada piso es una fila de cilindros en perspectiva simple (el piso posterior se dibuja más arriba y más pequeño). Ligero, testable, offline.
2. Canvas 2D: mismo resultado, pero redibujar todo en cada cambio y sin accesibilidad de elementos. Descartado.
3. Three.js / WebGL: el aspecto más fiel a Oeni, pero +20 MB, más lento en móvil y rompe el objetivo "sin ataduras". Descartado.

## 5. Modelo de datos

```ts
interface CaveConfig {
  width: number;    // botellas por fila (ancho), 1..20, por defecto 8
  depth: number;    // filas por piso (profundidad), 1..4, por defecto 1
  shelves: number;  // pisos, 1..8, por defecto 3
  fill: 'wine' | 'type'; // por defecto 'wine'
}
```

- Capacidad = `width × depth × shelves`. Si hay más botellas que huecos, las sobrantes se dibujan en una "pila" aparte con su conteo.
- La configuración se guarda en `localStorage['micava.cave']` como JSON; se lee al montar y se escribe al cambiar. Sin migraciones.

## 6. Pantalla Cava 3D

- Ruta: se abre desde Mi Cava con el botón "Ver cava 3D" (misma pestaña, la vista reemplaza a la lista; un botón "Volver a la lista" regresa). No se añade una pestaña nueva a la navegación.
- Cabecera: título "Cava 3D", el total "N botellas en la cava" y un chip de capacidad "N / capacidad".
- Vista SVG: los pisos se dibujan de arriba (el último) a abajo (el primero). Cada fila lleva su número a la izquierda. Cada botella es un cilindro: rectángulo + elipse superior, con el color del tipo y un brillo dorado si está en apogeo (estado `ready`).
- Colores por tipo: tinto `#7A2233`, blanco `#C2A369`, rosado `#C98A92`, espumoso `#D9C27E`, dulce `#8A5A2F`, fortificado `#5C3A21`, sin tipo `#6B625A`.
- Interacción: tocar una botella abre la ficha del vino existente (`WineDetailSheet`), igual que tocar la lista.
- Vacío: si no hay botellas, `EmptyState` con el botón "Añadir vino".

## 7. Relleno

- `fill: 'wine'` (por defecto): las botellas de un mismo vino ocupan huecos consecutivos; el orden de los vinos es el mismo de la lista (actualización más reciente primero).
- `fill: 'type'`: primero todos los tintos, luego blancos, rosados, etc.; dentro de cada tipo, mismo orden.
- El relleno es una función pura `layoutCave(wines, config): Cell[][]` que se prueba en aislamiento (tests/unit, sin DOM).
- Si el total no llena la cava exactamente, los huecos vacíos quedan dibujados en contorno punteado.

## 8. Estadísticas completas

Pantalla Ajustes → sección "Estadísticas" (sustituye a "Tu cava en números" actual, que la incluye y la amplía):

- Cuatro cifras ya presentes: Botellas, Referencias, Valor estimado, Última exportación.
- **Gráfico circular** de reparto por tipo en botellas: sectores SVG con el color del tipo, leyenda a la derecha con nombre, conteo y porcentaje. Sin librerías: un path por sector calculado con trigonometría simple; la función `donutSegments(counts)` es pura y testeable.
- **Tarjetas de apogeo**: una por estado (Listo, Guardar, Pronto, Sin datos) con el conteo de botellas, el porcentaje sobre el total y una barra de progreso con el color del estado.
- **Evolución de descorches**: conteo de descorches por mes de los últimos 12 meses, dibujado como barras verticales simples (la misma línea de tiempo de Historial, agregada). Se calcula con una función pura `monthlyConsumptions(events, year)`.
- La sección de barras por tipo actual queda sustituida por el gráfico circular; el resto de Ajustes no cambia.

## 9. Interfaz de configuración

En Ajustes, dentro de la sección nueva "Cava 3D":

- Tres steppers (− / +) para Ancho (1..20), Profundidad (1..4) y Pisos (1..8), con el mismo patrón que el de botellas del formulario Añadir.
- Selector "Rellenar por": vino / tipo (dos botones tipo chip con `aria-pressed`).
- La línea de capacidad recalcula en vivo: "Capacidad: 8 × 1 × 3 = 24 botellas".
- No hay botón Guardar: cada cambio se aplica y se persiste al instante.

## 10. Decisión

- 2D en SVG, sin dependencias nuevas.
- Una sola cava; configuración en `localStorage['micava.cave']`.
- Relleno por vino por defecto; el relleno es una función pura testeable.
- Las estadísticas amplían la sección de Ajustes existente; no se añade una pestaña nueva a la navegación.
- El color de las botellas es el del tipo; el brillo dorado marca el apogeo.
- Tocar una botella abre la ficha existente.

## 11. Riesgos

- Cava muy grande (20×4×8 = 640 cilindros): el SVG lo aguanta en un móvil moderno, pero se fija el máximo de capacidad a 320 (20×4×4) para no degradar; si el usuario configura más, el aviso lo dice.
- El gráfico circular con un solo tipo: un círculo completo; la leyenda debe seguir mostrando el 100 %.
- La evolución de descorches con meses vacíos: barras de altura cero con el mes pintado en gris.
