# Documento de diseño — Punto Crítico

> Estado: base funcional con el contenido v1 del documento "Punto Crítico" (15 retos).

## 1. Concepto

Juego final ("final boss") del Diplomado en Habilidades Gerenciales de AMV. Entre 2 y 6 equipos
asumen el papel de un **comité directivo** que debe entregar un proyecto clave (provisionalmente
"Proyecto Horizonte") durante **un día** lleno de complicaciones. Se juega presencialmente, con la
app proyectada en 16:9 y un facilitador que conduce.

Debe sentirse como un simulador de estrategia / juego de mesa digital, **no como un examen**:

- No hay respuestas "correctas" que sumen puntos. Hay **decisiones con costos** que mueven varios
  indicadores a la vez, a veces en direcciones opuestas.
- Las consecuencias no siempre son inmediatas: algunas aparecen turnos después.
- Lo que se recuerda al final es el **perfil** con que dirigió cada comité, no un número.

## 2. Loop principal

```
Tablero ──► Abrir reto ──► Narrativa + (temporizador) ──► Decisión / calificación
   ▲                                                            │
   │                                         efectos inmediatos en indicadores
   │                                                            │
   └── eventos en cola (condicionales / diferidos / manuales) ◄─ Continuar
```

1. El **tablero** muestra la ruta del día, la siguiente misión, quién responde y los indicadores.
2. **Abrir reto** proyecta la situación (narrativa, instrucciones, temporizador si aplica).
3. Se **resuelve**: el equipo elige una opción o el facilitador califica (éxito / parcial / fallo).
4. Se muestran **feedback y cambios** en indicadores.
5. **Continuar**: el motor avanza, rota el turno, revisa consecuencias programadas y condiciones,
   y salta retos que no aplican. Los eventos resultantes aparecen como modal.
6. Al agotarse la agenda → **resultados finales**.

Estructura objetivo para 90 min: introducción (~5) · 12–15 retos principales (~60–65) ·
3–5 eventos sorpresa (~10) · cierre y resultados (~10).

## 3. Tipos de retos

| Tipo | Cómo se resuelve | Uso típico |
|---|---|---|
| `decision` | Opciones A/B/C con efectos | Dilemas gerenciales |
| `open` | Respuesta verbal; facilitador califica | Diagnóstico, argumentación |
| `timed` | Igual que `open`, con temporizador protagonista | Comunicar bajo presión |
| `negotiation` | Interacción física entre equipos; calificación por equipo | Negociación |
| `tool` | Aplicar herramienta (FODA, Eisenhower, matriz ponderada…) | Planeación |
| `crisis` | Opciones o calificación; tono de urgencia | Imprevistos |
| `event` | Situación narrativa con efecto | Ritmo, contexto |
| `physical` | Actividad fuera de pantalla; la app da instrucciones y tiempo | Dinámicas presenciales |

Cualquier tipo puede usar `options` (elegir) u `outcomes` (calificar), y `durationSec` (temporizador).
Un reto pertenece a **varias categorías** a la vez (módulos del diplomado).

## 4. Sistema de indicadores

Cinco indicadores por equipo, escala 0–100, valor inicial 50 (configurable en `indicators.ts`):

| Indicador | Representa |
|---|---|
| 📈 Resultados | Avance real del proyecto |
| 🤝 Equipo | Clima, confianza, energía |
| 🧭 Liderazgo | Credibilidad y dirección del comité |
| 💰 Recursos | Presupuesto, tiempo, capacidad |
| ⭐ Reputación | Confianza de cliente, otras áreas y dirección |

- Por debajo de `danger` (30) el indicador se pinta en alerta.
- **Índice global** = promedio ponderado normalizado (sólo para ordenar; nunca es "la calificación").
- Además hay **recursos contables** (fichas, p. ej. "Comodín de asesoría") separados de los indicadores.

## 5. Sistema de efectos

Un `Effect` puede, a la vez:

- sumar/restar **indicadores** (con límites min/max) y **recursos**;
- poner o quitar **banderas** (`setFlags`, `clearFlags`);
- **programar consecuencias** (`schedule: [{ event, afterSteps }]`);
- **inyectar un reto** en la agenda (`injectChallenge`) asignado al equipo;
- apuntar a `self` (por defecto), `all` u `others`.

Cada aplicación queda en el **historial** con indicadores antes/después.

## 6. Banderas (flags)

Marcas ocultas por equipo que registran "cómo ha jugado": `tolera-conductas`, `sobrecarga`,
`oculto-falla`… No se proyectan (el facilitador las ve y puede quitarlas). Sirven para condicionar
eventos y retos futuros sin que el consecuente sea obvio en el momento de decidir.

## 7. Eventos

Cada evento declara su tipo (`kind`): **condicional**, **consecuencia** o **sorpresa**. Puede incluir
una pregunta rápida, un mensaje de cierre y respuestas (`options`) cuyo efecto se suma al automático.


Aparecen como modal sobre el proyector y el facilitador decide **Aplicar** o **Descartar**.

- **Condicionales** (`trigger`): se evalúan para cada equipo al iniciar cada paso.
  Ej.: `equipo < 40` → "Alguien está pensando irse" (inyecta el reto de la renuncia).
- **Consecuencias diferidas**: programadas por una decisión. Ej.: ignorar el conflicto del
  "talento difícil" → dos pasos después "El precedente pesa".
- **Manuales / sorpresa**: el facilitador los activa para un equipo o para todos (auditoría, apagón…).

Reglas anti-saturación: máximo un evento condicional por equipo por paso; por defecto una vez por
equipo (`repeatable` lo cambia); `minStep` evita disparos demasiado tempranos.

## 8. Turnos

`TurnMode` por reto (o sobrescrito en la agenda):

| Modo | Estado |
|---|---|
| `active-team` — un equipo responde; el turno rota tras cada reto de este tipo | ✅ |
| `all-teams` — todos resuelven el mismo reto; se registra por equipo | ✅ |
| `interaction` — negociación entre equipos; el facilitador califica a cada uno | ✅ (como `all-teams`) |
| `per-team` — cada equipo recibe un reto distinto | ⏳ tipado, pendiente |

Los retos **inyectados** se asignan al equipo que los provocó y no rotan el turno.
El facilitador puede cambiar el equipo en turno en cualquier momento.

## 8b. Público vs. facilitador

La pantalla pública prioriza narrativa y consecuencias: muestra hacia dónde se movió cada indicador
(▲/▼, más flechas = impacto mayor) pero no los números. El facilitador ve números, criterios,
referencias, banderas y bonos. Los secretos (figura del reto 02, tarjetas del reto 06) se ven en una
vista privada aparte. El final no ordena equipos por puntos: muestra perfil, indicadores y reconocimientos.

## 9. Persistencia

- Estado completo serializable (`GameState`, versión 1) + pila de deshacer de 25 pasos.
- Autoguardado en `localStorage` en cada cambio; al recargar se retoma la partida.
- La ventana del facilitador y la del proyector se sincronizan mediante eventos de `storage`.
- Respaldo manual: descargar / cargar JSON.
- `GameStorage` es una interfaz: un adaptador de Supabase puede sustituir a `localStorage`.

## 10. Ideas futuras

- Modo `per-team` real y mazo de eventos aleatorios con pesos.
- Recursos "gastables" con efecto mecánico (comodín que revela una pista o anula un evento).
- Alianzas y negociaciones con intercambio de recursos entre equipos.
- Votación desde celulares (cada equipo decide en su dispositivo) — requiere backend en tiempo real.
- Reporte final descargable (PDF) por equipo con su trayectoria y decisiones.
- Gráfica de evolución de indicadores a lo largo del día.
- Editor visual de contenido para facilitadores.
- Música ambiental por capítulo y efectos de transición más cinematográficos.
