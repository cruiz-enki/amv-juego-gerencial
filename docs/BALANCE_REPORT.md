# Reporte de balance — Punto Crítico

Generado con `npm run balance`: **5000 partidas** (1000 por estrategia, de 2 a 6 equipos), 20000 equipos simulados.

Estrategias: **aleatoria** (todo al azar), **óptima** (siempre lo que más suma, facilitador califica éxito), **conservadora** (evita pérdidas, cuida recursos), **resultados** (prioriza Resultados) y **personas** (prioriza Equipo y Liderazgo). Fuera de la óptima, la calidad de las respuestas abiertas se simula con probabilidades.

## Perfiles (% de equipos)

| Perfil | aleatoria | optima | conservadora | resultados | personas | **Total** |
|---|---:|---:|---:|---:|---:|---:|
| Equipo equilibrado | 0.4% | 0.0% | 0.9% | 0.9% | 0.9% | **0.6%** |
| Negociador | 0.8% | 100.0% | 7.5% | 10.2% | 14.2% | **26.5%** |
| Constructor de equipos | 6.7% | 0.0% | 80.1% | 68.0% | 66.9% | **44.3%** |
| Estratega | 5.1% | 0.0% | 1.0% | 2.1% | 1.8% | **2.0%** |
| Ejecutor | 24.1% | 0.0% | 7.1% | 11.0% | 11.0% | **10.6%** |
| Bombero profesional | 20.9% | 0.0% | 1.3% | 3.2% | 2.2% | **5.5%** |
| Estilo en construcción | 42.1% | 0.0% | 2.1% | 4.5% | 3.0% | **10.3%** |

## Indicadores finales (todas las estrategias)

| Indicador | mín | p10 | p25 | mediana | p75 | p90 | máx |
|---|---:|---:|---:|---:|---:|---:|---:|
| Resultados | 34 | 66 | 75 | 84 | 98 | 100 | 100 |
| Equipo | 0 | 49 | 65 | 76 | 86 | 89 | 96 |
| Liderazgo | 2 | 58 | 78 | 90 | 100 | 100 | 100 |
| Recursos | 8 | 41 | 49 | 58 | 69 | 79 | 82 |
| Reputación | 23 | 49 | 56 | 63 | 69 | 74 | 76 |

Mediana por estrategia:

| Indicador | aleatoria | optima | conservadora | resultados | personas |
|---|---:|---:|---:|---:|---:|
| Resultados | 70 | 100 | 83 | 82 | 85 |
| Equipo | 49 | 89 | 77 | 74 | 75 |
| Liderazgo | 58 | 100 | 90 | 90 | 90 |
| Recursos | 49 | 79 | 56 | 56 | 57 |
| Reputación | 52 | 74 | 62 | 61 | 63 |

## Rangos alcanzados (% de equipos)

| Indicador | ≤ 30 | ≤ 35 | ≥ 60 | ≥ 65 | ≥ 70 | ≥ 75 | ≥ 80 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Resultados | 0.0% | 0.0% | 96.2% | 92.0% | 85.3% | 75.2% | 62.8% |
| Equipo | 1.8% | 3.3% | 82.2% | 76.1% | 66.2% | 53.2% | 39.5% |
| Liderazgo | 0.8% | 1.4% | 88.9% | 86.2% | 83.0% | 78.6% | 72.4% |
| Recursos | 2.0% | 4.5% | 44.9% | 32.5% | 24.5% | 20.8% | 0.0% |
| Reputación | 0.2% | 0.8% | 64.2% | 41.8% | 24.3% | 5.1% | 0.0% |

## Eventos (% de equipos que lo vivieron)

| Evento | Tipo | % |
|---|---|---:|
| Todo urge | conditional | 11.0% |
| Se contagia el comportamiento | consequence | 5.2% |
| La factura emocional | consequence | 5.1% |
| La entrega se retrasa | consequence | 17.9% |
| Dirección cuestiona el costo | consequence | 18.1% |
| Necesita acompañamiento adicional | consequence | 64.0% |
| La persona clave | conditional | 18.5% |
| El cliente no olvidó | conditional | 17.0% |
| La promesa regresa | conditional | 4.9% |
| La señal de la mañana | conditional | 17.0% |
| La reputación habla | conditional | 41.8% |
| La factura invisible | conditional | 3.3% |

## Reconocimientos

| Reconocimiento | % de partidas otorgado | ganadores promedio (empates) |
|---|---:|---:|
| Mejor liderazgo | 100.0% | 1.70 |
| Mejor estrategia | 100.0% | 1.50 |
| Mejor negociación | 100.0% | 1.72 |
| Mejor equipo | 100.0% | 1.05 |
| Mejor manejo de crisis | 100.0% | 2.36 |
| Mejor uso de recursos | 100.0% | 1.64 |
| Mayor reputación | 100.0% | 1.07 |

## Alertas

- Perfiles prácticamente imposibles (< 0.5% total): ninguno ✅
- Perfiles demasiado frecuentes (> 50% al azar o > 45% total): ninguno ✅
- Eventos que nunca ocurrieron: ninguno ✅
- Partidas que no terminaron: ninguna ✅
