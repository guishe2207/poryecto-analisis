# Splendor — Mercado Inteligente (Análisis Numérico MVP)

## Contexto Académico
Proyecto para la materia **Análisis Numérico**. App web basada en el juego de mesa *Splendor* con **Derivación Numérica por Diferencias Finitas** integrada en las mecánicas principales como un "Mercado Inteligente" dinámico.

## Tech Stack
- **React 18** + **Vite** (SPA ultrarrápida)
- **TailwindCSS** (estilos gaming premium)
- **Recharts** (gráficos del dashboard matemático)
- **JavaScript puro** (toda la lógica matemática y del juego)

## Arquitectura
```
src/
├── data/
│   └── cards.js            # Cartas y nobles de Splendor
├── utils/
│   └── numericalDerivation.js  # Core matemático: f(x), f'(x), multiplicador
├── hooks/
│   ├── useGameState.js     # Reducer del juego (estado completo)
│   └── useNumericalMarket.js   # Hook que calcula derivadas y retorna multiplicador
├── components/
│   ├── Board/
│   │   ├── CardDisplay.jsx # Carta individual con precio ajustado
│   │   ├── CardGrid.jsx    # Grilla 3×4 de cartas visibles
│   │   ├── GemBank.jsx     # Banco de gemas (selección interactiva)
│   │   └── NobleRow.jsx    # Fila de nobles
│   ├── Player/
│   │   └── PlayerPanel.jsx # Panel de estadísticas del jugador
│   └── Dashboard/
│       ├── MathDashboard.jsx    # Panel matemático principal
│       └── PerformanceChart.jsx # Gráfico Recharts de f(x) y f'(x)
└── App.jsx                 # Componente raíz
```

## Concepto Matemático Central

### Índice de Rendimiento — f(x)
```
f(x) = 5·prestige + 2·cards + 1·total_gems + 8·nobles
```
Se calcula al final de cada turno del jugador (x = número de turno).

### Derivación Numérica (h = 1 turno)
- **Diferencia hacia adelante:** `f'(x) ≈ (f(x+1) - f(x)) / 1`
- **Diferencia hacia atrás:**  `f'(x) ≈ (f(x) - f(x-1)) / 1`
- **Diferencia central:**      `f'(x) ≈ (f(x+1) - f(x-1)) / 2`

### Impacto en el Mercado (multiplicador de precios)
| Derivada (backward)  | Multiplicador | Estado          |
|----------------------|---------------|-----------------|
| > 8                  | ×1.6          | Mercado Hostil  |
| > 4                  | ×1.35         | Mercado Tenso   |
| > 1                  | ×1.15         | Mercado Activo  |
| 0 a 1                | ×1.0          | Neutral         |
| ≤ 0                  | ×0.65         | Mercado Favorable |

El multiplicador se aplica a los costos de las cartas del tablero **solo para el jugador activo**.

## Comandos
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## Reglas del Juego (simplificadas para MVP)
- 2 jugadores en hotseat
- Banco: 4 gemas de cada tipo, 5 de oro (2 jugadores)
- Acciones por turno: Tomar gemas | Comprar carta | Reservar carta
- Victoria: primer jugador en llegar a 15 puntos de prestigio
- Nobles: se otorgan automáticamente si se cumplen requisitos de cartas
