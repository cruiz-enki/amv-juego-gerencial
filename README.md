# Punto Crítico · Juego final del Diplomado AMV

Aplicación web gamificada para la graduación del **Diplomado en Habilidades Gerenciales de AMV**.
Varios equipos asumen el papel de un comité directivo que debe entregar un proyecto en un día lleno
de crisis, decisiones, negociaciones y retos. Se juega **presencialmente, proyectada** (16:9) y
la conduce un facilitador. Duración objetivo: ~90 minutos.

> No es un quiz: es un simulador gerencial / juego de mesa digital. Cada decisión mueve cinco
> indicadores (Resultados, Equipo, Liderazgo, Recursos, Reputación) y algunas dejan
> consecuencias que aparecen varios turnos después.

El contenido v1 (15 retos, 9 eventos, 6 perfiles y 7 reconocimientos) viene del documento
"Punto Crítico" entregado por Carlos y vive en `src/content/`.

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
| `npm test` | Pruebas del motor, validación del contenido y simulación de balance |
| `BALANCE=1 npm test -- balance` | Muestra el reporte de balance (300 partidas simuladas) |
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

**Lo que ve el público vs. lo que ve el facilitador.** En pantalla se muestra la narrativa y
*hacia dónde* se movió cada indicador (▲▲ / ▼), no los números. El panel del facilitador siempre muestra
los números, las notas privadas, la respuesta de referencia, las banderas y los bonos. El modo de
efectos en pantalla (Ocultos / Flechas / Números) se cambia en vivo desde el panel.

**Vista privada (#/privado):** para retos con información secreta (la figura del reto 02, las
tarjetas de objetivos del reto 06), el botón "🔒 Vista privada" del panel abre una ventana que se
muestra sólo al representante (en la laptop o un celular, nunca en el proyector).

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
│   ├── flags.ts          catálogo de banderas (nombre legible de cada marca)
│   ├── results.ts        perfiles gerenciales y reconocimientos
│   ├── balance.test.ts   simulación de balance
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

### Campos públicos y privados de un reto

| Público (se proyecta) | Privado (sólo facilitador) |
|---|---|
| `narrative`, `items`, `table`, `instructions` | `facilitator.notes`, `facilitator.reference`, `facilitator.debrief` |
| `followUp` (cuando el facilitador lo revela) | `secret` (figura, tarjetas) → vista privada |
| `takeaway` (tras resolver), `callbacks` (según historial) | `outcomes[x].criteria`, efectos numéricos |
| feedback de opciones/resultados | `facilitatorFlags`, `bonuses` |

Otros campos útiles: `code` (número de reto), `clock` (hora en pantalla), `minutes` (duración
planeada), `inPerson` (presencial), `ambience: 'crisis'` (pantalla de alerta), `showDossier`
(expediente por equipo, usado en El Consejo). Los resultados calificados pueden tener claves propias
(p. ej. `'rechazo-rigido'`) indicando `tone: 'fail'`.

**Tipo de pieza:** reto principal = está en `agenda`; consecuencia diferida = evento `kind: 'consequence'`;
evento condicional = `kind: 'conditional'` con `trigger`; reto global = `turnMode: 'all-teams'` o
`'interaction'`; reto por equipo = `active-team`; reto presencial = `inPerson: true`.

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

Cada evento declara `kind` (`conditional`, `consequence` o `surprise`), puede tener `question`,
`takeaway` y `options` (respuestas que se suman al efecto automático, p. ej. "gastar Recursos para
recuperar a la persona"). `maxStep` limita hasta cuándo puede aparecer.

**Consecuencias diferidas:** en el efecto de una opción usa
`schedule: [{ event: 'clima-tenso', afterSteps: 2 }]` y el evento aparecerá dos pasos después.
**Banderas ocultas:** `setFlags: ['sobrecarga']` / `clearFlags` marcan al equipo para condiciones futuras.
Toda bandera debe existir en `flags.ts` (la validación lo revisa). Con `facilitatorFlags` en un reto,
el facilitador las marca a mano (p. ej. "ignoraron al cliente" en el reto 01).
**Bonos:** `bonuses` en un reto son ajustes que el facilitador otorga por equipo (una vez; los del mismo
`group` son excluyentes). Pueden programar mini eventos (reto 08: proveedor elegido).
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

**Terminado y verificado** (build, lint, 19 pruebas incluida una simulación de 300 partidas, y una
partida completa jugada en el navegador a 1920×1080 sin errores de consola):

- Motor de juego tipado y probado: indicadores, banderas, condiciones (incluida la diferencia entre
  indicadores), efectos, consecuencias diferidas, eventos condicionales con ventana de pasos, eventos
  con respuesta, bonos del facilitador, retos inyectados, modos de turno, temporizador e historial.
- **Contenido v1 cargado**: 15 retos con hora, duración y efectos del documento; 9 eventos (2 sorpresas
  condicionales tempranas, consecuencia A, 3 mini eventos de proveedor, 3 condicionales tardíos); 6
  perfiles; 7 reconocimientos; textos de cierre.
- Separación público / privado: en pantalla flechas en vez de números; el facilitador ve todo.
- Vista privada para la figura del reto 02 y las tarjetas del reto 06.
- Expediente por equipo en El Consejo; resultados finales sin ranking; "Misión completada" y pantalla final.
- Persistencia local, deshacer y ventana del facilitador sincronizada.

**Provisional / por definir:**

- **Balance (importante):** con los números del documento, incluso un equipo que siempre elige lo
  mejor termina cerca de **Equipo 63 y Reputación 61** (4 equipos). Por eso hoy son prácticamente
  inalcanzables: perfil *Constructor de equipos* (Equipo ≥ 75), *Negociador* y el evento *La reputación
  habla* (Reputación ≥ 75). En simulación aleatoria ~78% de los equipos cae en el perfil de respaldo.
  Causa: casi toda la Reputación y gran parte de Equipo vienen de retos de "equipo activo", y cada
  equipo sólo juega 1–2 de ellos. Opciones: bajar umbrales, subir efectos o volver globales algunos retos.
  Verlo con `BALANCE=1 npm test -- balance`.
- Perfil de respaldo "Estilo en construcción": no viene en el documento; hace falta para equipos que
  no cumplen ningún perfil.
- Reto 02: figura provisional en `public/figuras/mensaje-imposible.svg`.
- Reto 06: sólo hay 3 tarjetas de objetivo secreto (las del ejemplo); faltan las de los equipos 4–6.
- Reto 14: el resultado de cada camino (lanzar / retrasar / piloto) aún no está definido; hoy sólo se
  registra el camino elegido.
- Reto 01 "riesgo_proveedor" y reto 09 "promesa_sin_informacion" se registran pero aún no detonan nada.
- Consecuencia A: aparece 3 retos después del 03 (justo antes del reto 07), como dice el documento.
- Identidad visual neutral ("centro de mando"), sin marca aplicada.

**Recomendado para la siguiente iteración:**

1. Decidir el ajuste de balance y volver a correr la simulación.
2. Completar tarjetas del reto 06, figura definitiva del reto 02 y resultados del reto 14.
3. Ensayo cronometrado con facilitadores (la agenda suma 85 min planeados + eventos).
4. Aplicar identidad de marca (tokens en `src/index.css`).
5. Exportar el expediente / resultados finales (PDF) para entregar a cada equipo.
