# Guía de contenido — cómo escribir los casos reales

Esta guía es para quien diseñe el contenido pedagógico. **No hace falta tocar componentes**: todo se
escribe en `src/content/`. Después de cada cambio, `npm test` valida que no haya ids rotos.

## 1. Flujo de trabajo sugerido

1. **Mapa de aprendizaje**: por cada módulo del diplomado, 2–3 conceptos clave que el juego debe
   activar (ej. Comunicación → estructura de mensaje, escucha, retroalimentación).
2. **Arco narrativo del día**: qué pasa a las 08:00, 10:00, 12:00… Define 5–6 capítulos en
   `chapters.ts` y una premisa en `config.ts`.
3. **Lista de situaciones** (12–15): cada una cruza 2–4 categorías. Varía los tipos (ver tabla abajo).
4. **Efectos y consecuencias**: decide qué indicadores mueve cada alternativa y qué deja "sembrado".
5. **Eventos** (3–5 sorpresas + 2–4 condicionales).
6. **Ensayo cronometrado** y ajuste de números.

## 2. Plantilla de reto

Copia este bloque en un archivo de `src/content/challenges/` y llénalo:

```ts
{
  id: 'kebab-case-unico',
  title: 'Título corto y evocador',
  type: 'decision',
  categories: ['liderazgo', 'comunicacion'],
  chapter: 'operacion',
  narrative: 'Situación en 2–4 frases. Concreta, con nombres y hora si ayuda.',
  instructions: ['(Opcional) qué deben hacer, en pasos breves'],
  durationSec: 120,
  options: [
    { id: 'a', label: 'Acción en verbo infinitivo', detail: 'Matiz opcional', feedback: 'Qué pasó', effect: { indicators: { liderazgo: 4, resultados: -2 } } },
    { id: 'b', label: '…', feedback: '…', effect: { … } },
    { id: 'c', label: '…', feedback: '…', effect: { … } },
  ],
  facilitator: {
    notes: 'Concepto del diplomado que se juega aquí, qué observar, consecuencias ocultas.',
    debrief: ['Pregunta de reflexión 1', 'Pregunta de reflexión 2'],
  },
}
```

Para retos calificados por el facilitador, cambia `options` por `outcomes` (`success`, `partial`, `fail`)
y describe en `facilitator.notes` el **criterio** de cada nivel.

### Público vs. privado

Todo lo que va en `narrative`, `items`, `table`, `instructions`, `followUp`, `takeaway`, `callbacks`
y en el `feedback` se proyecta. Todo lo que va en `facilitator.*`, `secret`, `criteria`,
`facilitatorFlags` y `bonuses` sólo lo ve el facilitador. Los números de los efectos nunca se
proyectan salvo que el facilitador cambie el modo a "Números".

Para conectar decisiones a lo largo del día:
- **Callback** (texto que aparece si el equipo hizo algo antes): reto 11 recuerda "eliminaron capacitación".
- **Bandera del facilitador**: la marca a mano durante el reto (reto 01, 05, 14).
- **Bono**: ajuste extra por equipo (reto 06) o para registrar una elección que dispara un mini evento (reto 08).
- **Evento con respuesta**: el evento pregunta y el equipo decide (Todo urge, La persona clave).

## 3. Qué tipo usar

| Si quieres… | Usa |
|---|---|
| Un dilema con costos | `decision` |
| Que expliquen, diagnostiquen o argumenten | `open` |
| Presión de tiempo visible | `timed` (+ `durationSec`) |
| Que hablen con otro equipo | `negotiation` + `turnMode: 'interaction'` |
| Aplicar FODA, Eisenhower, matriz ponderada, árbol de decisiones | `tool` |
| Un golpe inesperado que exige decidir | `crisis` |
| Una actividad física / presencial | `physical` |

Usa `turnMode: 'all-teams'` cuando todos deban resolver lo mismo (bueno para arrancar y cerrar).

## 4. Reglas para buenas decisiones

- **Sin respuesta obvia.** Cada opción debe tener al menos un costo y un beneficio.
  Evita "A = bien, B = mal, C = muy mal".
- **El costo puede ser diferido.** La opción tentadora gana algo hoy y siembra una bandera o
  programa un evento (`schedule`). Así se enseña el pensamiento de segundo orden.
- **Feedback descriptivo, no moralizante.** Describe lo que ocurrió ("el equipo absorbe la diferencia
  con esfuerzo extra") en lugar de juzgar ("esa fue una mala decisión").
- **Opciones en verbo infinitivo**, cortas (se leen proyectadas desde el fondo del salón).
- **Narrativa ≤ 60 palabras.** Si necesitas más, divide en instrucciones.

## 5. Calibrar los números

- Escala de efectos sugerida por decisión: **±2 a ±8** por indicador; ±10–12 sólo para crisis graves.
- Que la suma neta de cada opción sea parecida (−2 a +6). Lo que cambia es **dónde** cae el costo.
- Con ~12 retos y valor inicial 50, un equipo que decide bien debería terminar entre 60–75 en
  la mayoría de indicadores; uno descuidado, con 1–2 por debajo de 40.
- Revisa que los eventos condicionales sean alcanzables (p. ej. `equipo < 40` necesita que algunas
  opciones bajen Equipo de forma acumulada).

## 6. Banderas y consecuencias

Nombra las banderas en kebab-case describiendo el **comportamiento**, no el resultado:
`tolera-conductas`, `sobrecarga`, `oculto-falla`, `promesa-sin-respaldo`.

Patrón típico:

```ts
// En la opción tentadora:
effect: { indicators: { resultados: 4 }, setFlags: ['promesa-sin-respaldo'], schedule: [{ event: 'cliente-cobra-promesa', afterSteps: 3 }] }
// En events.ts:
{ id: 'cliente-cobra-promesa', title: '…', tone: 'crisis', narrative: '…', effect: { indicators: { reputacion: -8 } } }
```

O un evento condicional que combine bandera + umbral:
`trigger: { all: [{ flag: 'sobrecarga' }, { indicator: 'equipo', op: '<', value: 55 }] }`.

## 7. Perfiles y reconocimientos

En `src/content/results.ts`. Los perfiles se evalúan **en orden** y gana el primero que cumple su
condición; el último debe quedar sin condición (respaldo). Escríbelos en positivo: describen un
estilo de dirección y su área de oportunidad.

## 8. Revisar el balance

`BALANCE=1 npm test -- balance` simula 300 partidas y muestra cómo se reparten perfiles, eventos
e indicadores finales, además del "techo" de un equipo que siempre elige lo mejor. Si un perfil o
evento nunca aparece, su umbral es inalcanzable con los efectos actuales.

## 9. Checklist antes de un ensayo

- [ ] `npm test` en verde (sin referencias rotas).
- [ ] Cada reto tiene `facilitator.notes` con el concepto del diplomado que activa.
- [ ] Todos los módulos del diplomado aparecen en al menos 2 retos.
- [ ] Hay al menos 2 consecuencias diferidas y 2 eventos condicionales alcanzables.
- [ ] La agenda suma ~65 minutos de retos (estimando 4–5 min por reto con debrief).
- [ ] Textos revisados para leerse proyectados (cortos, sin jerga innecesaria).
