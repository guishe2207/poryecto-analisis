import PerformanceChart from './PerformanceChart';

function DerivRow({ label, value, formula, color, method }) {
  const isNull = value === null || value === undefined;
  return (
    <div className="bg-gray-900 rounded-lg p-2 border border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${color}`}>{label}</span>
        <span className={`font-mono font-bold text-sm ${isNull ? 'text-gray-600' : value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-gray-300'}`}>
          {isNull ? '—' : value.toFixed(3)}
        </span>
      </div>
      <div className="text-gray-600 text-[9px] font-mono leading-tight">{formula}</div>
    </div>
  );
}

function ErrorRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`${color} font-medium`}>{label}</span>
      <span className="font-mono text-gray-300">
        {value === null ? '—' : `|E| = ${value.toFixed(4)}`}
      </span>
    </div>
  );
}

/**
 * MathDashboard — Panel lateral de Análisis Numérico.
 * Muestra f(x), f'(x) (3 métodos), errores de aproximación y el multiplicador del mercado.
 */
export default function MathDashboard({ marketData, playerName }) {
  if (!marketData) return null;

  const {
    currentFx, previousFx, deltaFx,
    derivatives, errors, multiplier, marketStatus,
    chartData, formulas, turnCount,
  } = marketData;

  const { forward, backward, central } = derivatives;
  const { forwardError, backwardError } = errors;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-950 p-4 xl:h-full xl:overflow-y-auto">

      {/* Título */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 neon-green">
          Dashboard Matemático
        </h2>
        <p className="text-gray-500 text-[10px]">Derivación Numérica · {playerName}</p>
      </div>

      {/* f(x) actual */}
      <div className="bg-gray-900 border border-emerald-900 rounded-xl p-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Índice de Rendimiento actual</div>
        <div className="flex items-end gap-2">
          <div>
            <span className="font-mono text-2xl font-bold text-emerald-400 sm:text-3xl">{currentFx}</span>
            <span className="text-gray-500 text-xs ml-1">f({turnCount})</span>
          </div>
          {deltaFx !== null && (
            <span className={`text-sm font-bold mb-1 ${deltaFx > 0 ? 'text-emerald-400' : deltaFx < 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {deltaFx > 0 ? '+' : ''}{deltaFx}
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-600 font-mono mt-1">
          f(x) = 5·prestige + 2·cards + 1·gems + 8·nobles
        </div>
        {previousFx !== null && (
          <div className="text-[10px] text-gray-600 font-mono">
            = 5·? + 2·? + 1·? + 8·? = {currentFx}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div>
        <PerformanceChart chartData={chartData} showDerivatives={turnCount >= 2} />
      </div>

      {/* Derivadas */}
      <div className="space-y-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">f′(x) — Diferencias Finitas (h = 1 turno)</div>

        <DerivRow
          label="▶ Diferencia hacia Adelante"
          value={forward}
          color="text-blue-400"
          formula={formulas.forward}
        />
        <DerivRow
          label="◀ Diferencia hacia Atrás  ← ACTIVA"
          value={backward}
          color="text-yellow-400"
          formula={formulas.backward}
        />
        <DerivRow
          label="◈ Diferencia Central (más precisa)"
          value={central}
          color="text-purple-400"
          formula={formulas.central}
        />
      </div>

      {/* Errores de aproximación */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-2 space-y-1">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Error vs. Diferencia Central</div>
        <ErrorRow label="Error Adelante"  value={forwardError}  color="text-blue-400" />
        <ErrorRow label="Error Atrás"     value={backwardError} color="text-yellow-400" />
        <p className="text-[9px] text-gray-600 mt-1">
          La diferencia central tiene error O(h²) vs O(h) de las otras dos. Con h=1 la diferencia es visible.
        </p>
      </div>

      {/* Mercado inteligente */}
      <div className={`rounded-xl border p-3 ${marketStatus.bg}`}>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Estado del Mercado Inteligente</div>
        <div className={`text-sm font-bold sm:text-base ${marketStatus.color}`}>{marketStatus.label}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-400 text-xs">Multiplicador:</span>
          <span className={`font-mono text-base font-bold sm:text-lg ${multiplier > 1 ? 'text-red-400' : multiplier < 1 ? 'text-emerald-400' : 'text-gray-300'}`}>
            ×{multiplier.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{marketStatus.description}</p>
        <div className="mt-2 bg-gray-900/60 rounded p-1.5 text-[9px] text-gray-500 font-mono">
          f′({turnCount}) = {backward !== null ? backward.toFixed(2) : '—'}
          {backward !== null && backward > 1 && ' → Penalización activa'}
          {backward !== null && backward <= 0 && ' → Descuento activo'}
        </div>
      </div>

      {/* Leyenda de pesos */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pesos del índice de rendimiento</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-mono">
          <span className="text-yellow-400">W_prestige = 5</span>
          <span className="text-blue-400">W_cards = 2</span>
          <span className="text-emerald-400">W_gems = 1</span>
          <span className="text-purple-400">W_nobles = 8</span>
        </div>
      </div>
    </div>
  );
}
