# Reporte de balance — Punto Crítico

Generado con `npm run balance`: **5000 partidas** (1000 por estrategia, de 2 a 6 equipos), 20000 equipos simulados.

Estrategias: **aleatoria** (todo al azar), **óptima** (siempre lo que más suma, facilitador califica éxito), **conservadora** (evita pérdidas, cuida recursos), **resultados** (prioriza Resultados) y **personas** (prioriza Equipo y Liderazgo). Fuera de la óptima, la calidad de las respuestas abiertas se simula con probabilidades.

## Perfiles (% de equipos)

| Perfil | aleatoria | optima | conservadora | resultados | personas | **Total** |
|---|---:|---:|---:|---:|---:|---:|
| Equipo equilibrado | 0.3% | 0.0% | 2.3% | 1.1% | 1.2% | **1.0%** |
| Negociador | 0.4% | 100.0% | 5.8% | 7.5% | 10.5% | **24.9%** |
| Constructor de equipos | 3.6% | 0.0% | 53.9% | 47.0% | 49.5% | **30.8%** |
| Estratega | 4.5% | 0.0% | 3.8% | 4.8% | 4.8% | **3.6%** |
| Ejecutor | 24.1% | 0.0% | 20.5% | 21.3% | 21.6% | **17.5%** |
| Bombero profesional | 21.9% | 0.0% | 5.1% | 6.9% | 5.1% | **7.8%** |
| Estilo en construcción | 45.2% | 0.0% | 8.6% | 11.5% | 7.3% | **14.5%** |

## Indicadores finales (todas las estrategias)

| Indicador | mín | p10 | p25 | mediana | p75 | p90 | máx |
|---|---:|---:|---:|---:|---:|---:|---:|
| Resultados | 28 | 65 | 73 | 82 | 95 | 100 | 100 |
| Equipo | 6 | 49 | 61 | 69 | 76 | 78 | 85 |
| Liderazgo | 13 | 59 | 76 | 87 | 99 | 100 | 100 |
| Recursos | 12 | 41 | 49 | 57 | 69 | 79 | 81 |
| Reputación | 21 | 49 | 56 | 62 | 68 | 72 | 74 |

Mediana por estrategia:

| Indicador | aleatoria | optima | conservadora | resultados | personas |
|---|---:|---:|---:|---:|---:|
| Resultados | 69 | 100 | 81 | 80 | 82 |
| Equipo | 49 | 78 | 70 | 68 | 69 |
| Liderazgo | 60 | 100 | 86 | 87 | 87 |
| Recursos | 49 | 79 | 56 | 55 | 56 |
| Reputación | 52 | 72 | 61 | 61 | 63 |

## Rangos alcanzados (% de equipos)

| Indicador | ≤ 30 | ≤ 35 | ≥ 60 | ≥ 65 | ≥ 70 | ≥ 75 | ≥ 80 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Resultados | 0.0% | 0.0% | 95.3% | 90.3% | 82.2% | 70.9% | 57.5% |
| Equipo | 1.3% | 2.7% | 77.1% | 65.3% | 48.7% | 30.4% | 6.4% |
| Liderazgo | 0.5% | 1.0% | 90.0% | 86.8% | 82.4% | 76.5% | 67.5% |
| Recursos | 2.0% | 4.7% | 44.0% | 31.8% | 24.2% | 20.8% | 0.0% |
| Reputación | 0.2% | 0.8% | 61.1% | 37.6% | 22.7% | 0.0% | 0.0% |

## Eventos (% de equipos que lo vivieron)

| Evento | Tipo | % |
|---|---|---:|
| Todo urge | conditional | 11.5% |
| Se contagia el comportamiento | consequence | 5.2% |
| La entrega se retrasa | consequence | 18.0% |
| Dirección cuestiona el costo | consequence | 18.2% |
| Necesita acompañamiento adicional | consequence | 63.8% |
| La persona clave | conditional | 18.5% |
| El cliente no olvidó | conditional | 17.0% |
| La promesa regresa | conditional | 5.2% |
| La señal de la mañana | conditional | 17.0% |
| La reputación habla | conditional | 37.6% |
| La factura invisible | conditional | 2.7% |

## Reconocimientos

| Reconocimiento | % de partidas otorgado | ganadores promedio (empates) |
|---|---:|---:|
| Mejor liderazgo | 100.0% | 1.66 |
| Mejor estrategia | 100.0% | 1.48 |
| Mejor negociación | 100.0% | 1.76 |
| Mejor equipo | 100.0% | 1.07 |
| Mejor manejo de crisis | 100.0% | 2.35 |
| Mejor uso de recursos | 100.0% | 1.64 |
| Mayor reputación | 100.0% | 1.07 |

## Alertas

- Perfiles prácticamente imposibles (< 0.5% total): ninguno ✅
- Perfiles demasiado frecuentes (> 50% al azar o > 45% total): ninguno ✅
- Eventos que nunca ocurrieron: ninguno ✅
- Partidas que no terminaron: ninguna ✅
