# Punto Crítico · Juego final del Diplomado AMV

Aplicación web gamificada para la graduación del **Diplomado en Habilidades Gerenciales de AMV**.
Varios equipos asumen el papel de un comité directivo que debe entregar un proyecto en un día lleno
de crisis, decisiones, negociaciones y retos. Se juega **presencialmente, proyectada** (16:9) y
la conduce un facilitador. Duración objetivo: ~90 minutos.

> No es un quiz: es un simulador gerencial / juego de mesa digital. Cada decisión mueve cinco
> indicadores (Resultados, Equipo, Liderazgo, Recursos, Reputación) y algunas dejan
> consecuencias que aparecen varios turnos después.

El nombre "Punto Crítico", la historia y todo el contenido son **provisionales (mock)**.

---

## Cómo correrlo

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Revisa tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión de producción |
| `npm test` | Pruebas del motor y validación del contenido |
| `npm run lint` | Linter (oxlint) |

No necesita internet durante el evento (las fuentes vienen incluidas) ni variables de entorno.

### Cómo se usa el día del evento

1. Conecta la laptop al proyector y abre la app en pantalla completa (botón ⛶).
2. **Nueva partida** → elige número de equipos (2–6), nombres, íconos y colores → **Comenzar el día**.
3. En el **tablero** se ve la ruta del día, la siguiente misión y los indicadores de cada equipo.
4. **Abrir reto** → se proyecta la situación. Según el tipo, el equipo elige una opción (A/B/C) o el
   facilitador califica (Éxito / Parcial / Fallo). Los cambios en indicadores se muestran al instante.
5. **Continuar** → avanza; si una condición se cumple, aparece un evento sobre la pantalla.
6. Al terminar la agenda se muestran **resultados finales**: indicadores, perfil gerencial y reconocimientos.

**Panel del facilitador:** botón 🎛️ o tecla **F**. Desde ahí: regresar (deshacer), avanzar, saltar,
pausar, temporizador, calificar, ajustar indicadores, activar eventos, ver notas privadas, historial
y respaldos. Con **"Abrir en otra ventana"** el panel se abre aparte (p. ej. en la pantalla de la
laptop mientras el proyector muestra el juego); ambas ventanas se sincronizan solas.

**Si se recarga la página** la partida continúa donde estaba (se guarda en el navegador). Para mayor
seguridad, "Descargar respaldo" baja un `.json` que se puede volver a cargar.

---

## Arquitectura

```
contenido (datos)  ──►  motor (lógica pura)  ──►  estado (React + persistencia)  ──►  UI
src/content/            src/engine/               src/state/                          src/components, src/screens
```

- **El contenido es data.** Retos, eventos, indicadores, categorías, capítulos, perfiles y
  reconocimientos son objetos TypeScript tipados. Ningún reto vive dentro de un componente.
- **El motor es puro.** `src/engine/reducer.ts` recibe el estado y una acción y devuelve el nuevo
  estado. No sabe nada de React ni del navegador, por eso se prueba con Vitest.
- **El estado** (`src/state/GameProvider.tsx`) envuelve el motor con deshacer (25 pasos),
  autoguardado y sincronización entre ventanas. El almacenamiento es una interfaz (`GameStorage`)
  con una implementación en `localStorage`; un adaptador de Supabase puede reemplazarla después.
- **La UI** sólo lee estado y despacha acciones.

Decisiones importantes:

| Decisión | Por qué |
|---|---|
| Vite + React + TS + Tailwind, sin router ni librerías de UI | Menos dependencias, arranca rápido, fácil de mantener. IECE usaba TanStack Start + Lovable; aquí no hace falta servidor. |
| Reducer puro con `now` en cada acción | Determinista, testeable y fácil de depurar. |
| Pantalla actual dentro del estado | El facilitador (otra ventana) controla qué se proyecta. |
| Condiciones y efectos como datos serializables | Agregar reglas = agregar datos, no código. |
| Sonidos sintetizados (WebAudio) | Sin archivos de audio; funciona sin internet; botón de silencio. |
| Fuentes incluidas vía `@fontsource` | El salón puede no tener internet. |
| Tokens de color en `src/index.css` | Cambiar a la identidad de marca final es editar un solo archivo. |

## Estructura de carpetas

```
src/
├── content/              ← TODO el contenido del juego (lo que se edita para crear casos)
│   ├── config.ts         título, premisa, rango de equipos, ORDEN de la agenda
│   ├── indicators.ts     los 5 indicadores (rango, valor inicial, color, umbral de alerta)
│   ├── categories.ts     módulos del diplomado
│   ├── chapters.ts       etapas del día (08:00, 10:00…) — texto libre
│   ├── resources.ts      fichas por equipo (p. ej. comodines)
│   ├── teamPresets.ts    colores e íconos para equipos
│   ├── challenges/       retos (uno o varios archivos) + index.ts que los junta
│   ├── events.ts         eventos condicionales, consecuencias y sorpresas
│   ├── results.ts        perfiles gerenciales y reconocimientos
│   └── index.ts          ensambla el contenido + validateContent()
├── engine/               ← lógica pura
│   ├── types.ts          todos los tipos (Challenge, GameEvent, Effect, Condition, GameState…)
│   ├── conditions.ts     evaluador de condiciones
│   ├── effects.ts        aplica efectos, registra historial, programa consecuencias
│   ├── reducer.ts        acciones del juego y flujo de turnos
│   ├── selectors.ts      consultas derivadas (equipo activo, progreso, índice global…)
│   ├── results.ts        perfiles, reconocimientos, ranking
│   └── engine.test.ts
├── state/                proveedor React, persistencia, hook useGame
├── components/           GameBoard, TeamCard, IndicatorBar, ChallengeCard, DecisionOptions,
│   │                     OutcomeButtons, Timer, EventModal, Scoreboard, FinalResults…
│   └── facilitator/      secciones del panel del facilitador
├── screens/              Home, Setup, Dashboard, Challenge, Scoreboard, Final, FacilitatorWindow
├── audio/                efectos de sonido
└── index.css             tokens visuales (colores, fuentes, animaciones)
docs/
├── GAME_DESIGN.md        diseño del juego
└── CONTENT_GUIDE.md      cómo escribir el contenido pedagógico
```

---

## Cómo agregar un reto

1. Abre (o crea) un archivo en `src/content/challenges/`.
2. Agrega un objeto `Challenge`:

```ts
{
  id: 'reunion-sin-agenda',           // único, sin espacios
  title: 'La reunión sin agenda',
  type: 'decision',                   // decision | open | timed | negotiation | tool | crisis | event | physical
  categories: ['comunicacion', 'planeacion'],   // puede tener varias
  chapter: 'operacion',               // id de src/content/chapters.ts
  narrative: 'Texto que se proyecta…',
  instructions: ['Opcional, una línea por instrucción'],
  durationSec: 120,                   // opcional: muestra temporizador
  turnMode: 'all-teams',              // opcional: active-team (por defecto) | all-teams | interaction
  options: [                          // para decisiones…
    { id: 'a', label: 'Cancelar la reunión', feedback: '…', effect: { indicators: { recursos: 4, reputacion: -2 } } },
  ],
  outcomes: {                         // …o para retos que califica el facilitador
    success: { label: 'Bien', feedback: '…', effect: { indicators: { liderazgo: 5 } } },
    partial: { feedback: '…', effect: { indicators: { liderazgo: 2 } } },
    fail:    { feedback: '…', effect: { indicators: { liderazgo: -3 } } },
  },
  facilitator: { notes: 'Sólo las ve el facilitador', debrief: ['Pregunta de cierre'] },
}
```

3. Si el archivo es nuevo, impórtalo en `src/content/challenges/index.ts`.
4. Agrega su `id` a `agenda` en `src/content/config.ts` (en el orden en que debe jugarse).
   Los retos que sólo aparecen por un evento **no** van en la agenda.
5. Corre `npm test`: la validación avisa de ids mal escritos o referencias rotas.

## Cómo agregar una categoría

Agrega `{ id, label, icon }` a `src/content/categories.ts` y úsala en `categories` de los retos.

## Cómo modificar indicadores

Edita `src/content/indicators.ts`: `label`, `icon`, `color`, `min`, `max`, `initial` (valor inicial),
`danger` (umbral de alerta, se pinta en rojo) y `weight` (peso en el índice global). Puedes agregar o
quitar indicadores: tarjetas, marcador y final se adaptan solos. Si quitas uno, actualiza los retos,
eventos y perfiles que lo usen (`npm test` te dirá cuáles).

## Cómo crear eventos condicionales

En `src/content/events.ts`:

```ts
{
  id: 'cliente-impaciente',
  title: 'El cliente pierde la paciencia',
  tone: 'negative',                 // positive | negative | neutral | crisis
  narrative: '…',
  trigger: { all: [ { indicator: 'reputacion', op: '<', value: 40 }, { flag: 'oculto-falla' } ] },
  minStep: 3,                       // no antes del paso 3
  effect: { indicators: { resultados: -5 }, injectChallenge: 'llamada-del-cliente' },
}
```

Condiciones disponibles: `indicator`, `resource`, `flag`, `chose` (eligió tal opción en tal reto),
`outcome` (obtuvo tal resultado), `completed`, `stepAtLeast`, y combinadores `all`, `any`, `not`.
El motor revisa los `trigger` al iniciar cada paso (máximo un evento condicional por equipo por paso;
por defecto cada evento se dispara una vez por equipo, `repeatable: true` lo cambia).

**Consecuencias diferidas:** en el efecto de una opción usa
`schedule: [{ event: 'clima-tenso', afterSteps: 2 }]` y el evento aparecerá dos pasos después.
**Banderas ocultas:** `setFlags: ['sobrecarga']` / `clearFlags` marcan al equipo para condiciones futuras.
**Eventos sin `trigger`** sólo aparecen por consecuencia o si el facilitador los activa.

## Cómo cambiar la configuración de partida

`src/content/config.ts`: título, subtítulo, premisa, rango de equipos (`teams.min/max/default`),
modo de turno por defecto, duración objetivo y la **agenda** (orden de retos; cada entrada puede
sobrescribir `turnMode`). Las etapas del día se cambian en `chapters.ts` (el campo `marker` es texto
libre: horas, fases, lo que sea).

---

## Seguridad

- No hay claves, tokens ni `.env` en el repo. `.env*` está en `.gitignore`; `.env.example` sólo
  documenta variables futuras.
- El repo de referencia IECE tiene un `.env` comprometido con datos de Supabase: **no se copió nada
  de él**.

---

## Estado actual

**Terminado y verificado** (build, lint, 12 pruebas, partida completa jugada en el navegador a 1920×1080):

- Motor de juego tipado y probado: indicadores, recursos, banderas, condiciones, efectos,
  consecuencias diferidas, eventos condicionales, retos inyectados, modos de turno
  (equipo activo, todos los equipos, interacción), temporizador e historial completo
  (decisión, equipo, indicadores antes/después, banderas, hora).
- Flujo completo: portada → configuración de equipos → tablero → retos → eventos → marcador → final.
- Panel del facilitador (cajón con tecla F o ventana aparte sincronizada) con deshacer, avanzar,
  saltar, pausar, temporizador, calificación, ajustes manuales, eventos, notas privadas, historial
  y respaldo/carga en JSON.
- Persistencia local: recargar la página conserva la partida (incluida la pila de deshacer).
- Resultados finales: ranking por índice global, perfil gerencial, reconocimientos y decisiones tomadas.
- Sonidos sintetizados con botón de silencio; animaciones ligeras (respetan "reducir movimiento").
- Validación automática del contenido (`npm test`).

**Provisional:**

- Nombre, historia, los 12 retos y 9 eventos son mock para probar el motor.
- Perfiles gerenciales y reconocimientos: reglas simples de ejemplo.
- Identidad visual neutral ("centro de mando"); aún sin la marca de AMV ni del proveedor del diplomado.
- El modo `per-team` (cada equipo un reto distinto) está tipado pero se comporta como "todos los equipos".
- La pantalla de resultados no exporta reporte (PDF) todavía.

**Recomendado para la siguiente iteración:**

1. Escribir el contenido real (ver `docs/CONTENT_GUIDE.md`): 12–15 retos, 3–5 sorpresas, balancear efectos.
2. Aplicar identidad de marca (tokens en `src/index.css`) y definir el nombre final.
3. Ensayo completo cronometrado con facilitadores para calibrar tiempos y efectos.
4. Implementar el modo `per-team` real y un mazo opcional de eventos aleatorios.
5. Exportar el resumen final (PDF o imagen) y una vista de historial por equipo para el cierre.
6. Si se necesita: adaptador `GameStorage` para Supabase (respaldo en la nube / varios dispositivos).
