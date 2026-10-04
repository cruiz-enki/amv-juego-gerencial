# Punto Crítico · Juego final del Diplomado AMV

Aplicación web gamificada para la graduación del **Diplomado en Habilidades Gerenciales de AMV**.
Varios equipos asumen el papel de un comité directivo que debe entregar un proyecto en un día lleno
de crisis, decisiones, negociaciones y retos. Se juega **presencialmente, proyectada** (16:9) y
la conduce un facilitador. Duración objetivo: ~90 minutos.

> No es un quiz: es un simulador gerencial / juego de mesa digital. Cada decisión mueve cinco
> indicadores (Resultados, Equipo, Liderazgo, Recursos, Reputación) y algunas dejan
> consecuencias que aparecen varios turnos después.

El contenido (15 retos, 11 eventos, 6 perfiles + respaldo, 7 reconocimientos) viene del documento
"Punto Crítico" entregado por Carlos y vive en `src/content/`.

---

## Probar en línea

**https://amv-juego-gerencial.vercel.app**

Despliegue estático en Vercel (HTTPS, sin backend, sin login). Cada `git push` a `main` vuelve a
desplegar producción automáticamente.

| URL | Para qué |
|---|---|
| **https://amv-juego-gerencial.vercel.app** | **La que se PROYECTA.** Juego, tablero, retos, eventos y resultados. |
| **https://amv-juego-gerencial.vercel.app/facilitador** | **La del FACILITADOR** (tu laptop o tablet): todos los controles, notas privadas y números. |
| **https://amv-juego-gerencial.vercel.app/privado** | **Vista privada**: figura del reto 02 y tarjetas secretas del reto 06. Nunca en el proyector. |
| **https://amv-juego-gerencial.vercel.app/admin** | **Administración de contenido**: revisar y editar retos, eventos, perfiles… antes de jugar. |

Las tres vistas se sincronizan solas **si están abiertas en el mismo navegador del mismo equipo**
(comparten el almacenamiento local). En un dispositivo distinto (p. ej. tu teléfono) la partida es
independiente. El panel también se abre dentro del proyector con el botón 🎛️ o la tecla **F**.

## Uso durante el evento

1. **Abrir el proyecto**: en la laptop conectada al proyector, abrir la URL principal y poner
   pantalla completa (botón ⛶).
2. **Configurar equipos**: *Nueva partida* → número de equipos (2–6), nombres, íconos, colores.
3. **Proyectar**: deja esa ventana en el proyector (pantalla extendida).
4. **Abrir el facilitador**: en la misma laptop, abre `/facilitador` en otra ventana (o el botón
   🎛️ → *Abrir en otra ventana*) y déjala en la pantalla de la laptop.
5. **Comenzar**: *Comenzar el día* → *Abrir reto*. Califica o registra a cada equipo desde el panel
   (o tocando las tarjetas del proyector) y pulsa *Continuar*. Los eventos aparecen solos.
6. **Si se recarga la página**: no pasa nada; la partida sigue exactamente donde estaba (incluido
   "Regresar").
7. **Respaldo**: panel → *Partida* → **Descargar respaldo** (archivo `.json`). Para recuperarlo:
   *Cargar respaldo*. Recomendado al terminar cada bloque horario.
8. **Reiniciar**: panel → *Partida* → **Reiniciar todo** (pide confirmación y borra la partida).

## Administración de contenido

**Dónde:** https://amv-juego-gerencial.vercel.app/admin (o “⚙️ Administrar contenido” en la portada; el
enlace no aparece durante una partida). Sin login. Pensado para computadora; usable en tablet.

**Qué se edita:** todo el contenido sin tocar código.
- **Retos** (pestañas): *General* (título, número, id, hora, capítulo, tipo, duración, modo, activo,
  presencial, en agenda) · *Contenido público* (narrativa, pregunta, listas, tabla, instrucciones,
  preguntas de seguimiento, mensaje de cierre, textos condicionados) · *Opciones* (agregar, borrar,
  reordenar, duplicar; texto, feedback, tono, notas; resultados calificados; bonos) · *Evaluación*
  (respuesta deseada: recomendada/aceptable/desaconsejada, criterios de éxito/parcial/fallo, puntos a
  observar, notas privadas) · *Efectos* (tabla de números por indicador) · *Banderas y consecuencias*
  (banderas que activa/quita, eventos diferidos con retraso, retos insertados, banderas manuales) ·
  *Ver cambios* (diferencias con el original).
- **Eventos**: tipo, tono, alcance, una sola vez, condición, momento (desde/hasta reto), efectos,
  respuestas, notas, quién lo programa.
- **Perfiles** (el orden importa; ↑↓ para reordenar; respaldo), **reconocimientos**, **indicadores**
  (inicial, mín, máx, alerta, etiqueta, ícono, color), **banderas** y **configuración general**.
- Listado con búsqueda y filtros (tipo, competencia, modo, global/multi/equipo, activo, presencial,
  con consecuencias, con banderas, modificados). Marca **Modificado** y **Nuevo** en cada elemento.
- **Vista previa** en cada reto/evento: *como participante* (la pantalla real del proyector, con 2, 4
  o 6 equipos), *como facilitador* (efectos, respuesta deseada, notas, banderas, criterios) y *como admin*.
- **Duplicar** reto/evento: crea una copia **inactiva** con id nuevo (actívala para usarla).
- **Activar/desactivar**: lo inactivo sigue en admin pero no entra en nuevas partidas.

**Cómo se guarda (tres niveles):**
1. **Base** — el contenido del código (`src/content`). Nunca se modifica desde la app.
2. **Borrador** — lo que editas en /admin. **Autoguardado** en este navegador (estado: *Guardando…* /
   *Guardado ✓*). Lleva versión local, fecha y número de cambios.
3. **Snapshot** — copia congelada para la **próxima partida**.

**Aplicar una configuración:** botón **“USAR ESTA CONFIGURACIÓN EN LA PRÓXIMA PARTIDA”**. Antes valida:
los **errores** (ids repetidos, retos sin título, opciones vacías, banderas o indicadores inexistentes,
condiciones inválidas, retos activos sin narrativa…) bloquean; las **advertencias** no. La portada
indica si la siguiente partida usará la configuración personalizada o la original.

**¿Y la partida ya iniciada?** Al empezar, cada partida guarda **su propia copia** de la configuración.
Lo que cambies después en /admin (incluso un snapshot nuevo) **no la altera**, ni al recargar. Se
aplica a la siguiente partida.

**Restaurar:** “↺ Restaurar este elemento” en cada reto/evento/perfil, o en *Versiones e importar* →
“Restaurar toda la configuración original” (pide confirmación; no toca el snapshot). “Quitar snapshot”
hace que la próxima partida vuelva a usar el original.

**Exportar / importar:** en *Versiones e importar*. Exporta un JSON con retos, eventos, perfiles,
reconocimientos, indicadores, banderas y configuración general. Al importar se valida el esquema; si
hay problemas se listan y **no se aplica nada**.

> Importante: todo vive en el navegador (localStorage). Para llevar tu configuración a otra
> computadora (p. ej. la del evento): **Exportar** aquí → **Importar** allá → **Usar en la próxima partida**.
> Para dejarla como contenido oficial del repositorio, pásame el JSON exportado.

## Cómo correrlo en local

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
| `npm test` | 82 pruebas: motor, contenido, escenarios, persistencia, administración, privacidad y una simulación corta |
| `npm run balance` | Simula 5 000 partidas y reescribe `docs/BALANCE_REPORT.md` |
| `npm run lint` | Linter (oxlint) |

No necesita internet durante el evento una vez cargada la página (las fuentes vienen incluidas) ni variables de entorno.

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
│   ├── negotiation.ts    tarjetas secretas del reto 06 (2–6 equipos)
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
├── state/                proveedor React, deshacer (rootReducer), persistencia, hook useGame
├── sim/                  simulador de balance (npm run balance)
├── admin/                /admin: borrador, snapshot, validación, diff, operaciones y editores (ui/)
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

## Cambios de balance (iteración 3)

Todos los cambios numéricos respecto al documento original:

| Cambio | Antes | Ahora | Motivo |
|---|---|---|---|
| Retos 03, 09, 11, 12, 14 | equipo en turno | **todos los equipos** | más participación; Equipo y Reputación ya pueden crecer |
| Constructor de equipos | Equipo ≥ 75 | Equipo ≥ 68 y Liderazgo ≥ 65 | indicado por Carlos |
| Negociador | Reputación ≥ 75 | Reputación ≥ 68 y Recursos ≥ 60 | indicado por Carlos |
| Ejecutor | Resultados ≥ 80 | Resultados ≥ 75 | indicado por Carlos |
| Evento "La reputación habla" | Reputación ≥ 75 | Reputación ≥ 65 | indicado por Carlos |
| Reto 01 · éxito | — | +2 Reputación | Reputación casi no podía subir (ajuste moderado) |
| Reto 02 · éxito | Liderazgo +4 | Liderazgo +2 | Liderazgo se saturaba en 100 |
| Reto 04 · éxito | Liderazgo +5 | Liderazgo +3 y +2 Reputación | ídem |
| Reto 10 · excelente | Liderazgo +8 | Liderazgo +6 y +3 Reputación | ídem; contienen al cliente que amenaza cancelar |
| Orden de perfiles | orden del documento | Equilibrado → Negociador → Constructor → Estratega → Ejecutor → Bombero | sin esto Negociador quedaba "tapado" (0%) |
| Reto 14 | sólo registraba el camino | A/B/C con efectos preconfigurados + argumento como bono | indicado por Carlos |
| `riesgo_proveedor` | sin efecto | −3 Resultados en el primer problema de proveedor (una vez) | indicado por Carlos |
| `promesa_sin_informacion` | sin efecto | evento "La promesa regresa" (−6 Lid, −5 Eq, −4 Rep), una vez | indicado por Carlos |

Resultado (5 000 partidas, ver `docs/BALANCE_REPORT.md`): todos los perfiles son alcanzables
(el más raro, Equipo equilibrado, ~1%), ninguno pasa de 50% jugando al azar y todos los eventos
ocurren. Una estrategia "óptima" pura (siempre lo que más suma) termina siempre en Negociador: es
un caso límite, no un estilo real.

## Estado actual

**Terminado y verificado**

- Build, lint y **82 pruebas** en verde (motor, contenido, retos multi-equipo, consecuencias, tarjetas
  de negociación, umbrales y perfiles, deshacer, localStorage, sincronización entre ventanas,
  restauración tras recarga, partidas completas con 2–6 equipos, **administración** —guardar,
  restaurar, duplicar, activar, exportar, importar, esquema, snapshot, partida congelada, vista previa,
  orden de perfiles, referencias de banderas— y **privacidad del proyector**).
- **/admin** probado en el navegador: edición, autoguardado, cambios, vista previa, duplicar,
  desactivar, snapshot, partida con snapshot y cambios posteriores sin afectarla.
- Simulación de balance: 5 000 partidas con 5 estilos de juego.
- Proyector 1920×1080 con 2, 4 y 6 equipos sin scroll (salvo El Consejo, a propósito).
- Desplegado en https://amv-juego-gerencial.vercel.app (estático, HTTPS, deploy automático desde `main`).

**Provisional**

- Reto 02: la figura (`public/figuras/mensaje-imposible.svg`) es provisional.
- Reto 06: las 6 tarjetas (`src/content/negotiation.ts`) son una propuesta de diseño; revisar montos
  y redacción.
- Perfil de respaldo "Estilo en construcción" y su texto.
- Textos de feedback del reto 14 y de los nuevos eventos se tomaron del encargo; el resto de
  feedback por opción no existe en el documento (los retos 03 y 09 sólo tienen mensaje general).
- Identidad visual neutral ("centro de mando"), sin marca aplicada; sin dominio propio.
- Sonidos sintetizados de prueba.

**Siguiente iteración recomendada**

1. Ensayo cronometrado con facilitadores (la agenda suma 85 min planeados + eventos).
2. Figura definitiva del reto 02 y revisión de las tarjetas del reto 06 (imprimibles).
3. Marca y dominio (p. ej. `puntocritico.aprendiendum.mx`).
4. Exportar el expediente de cada equipo (PDF) para entregarlo en El Consejo.
