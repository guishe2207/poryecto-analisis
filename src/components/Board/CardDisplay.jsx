import { GEM_CONFIG } from '../../data/cards';

const TIER_STYLES = {
  1: 'border-gray-500 from-gray-900 to-gray-800',
  2: 'border-yellow-600 from-yellow-950 to-gray-900',
  3: 'border-purple-500 from-purple-950 to-gray-900',
};

const TIER_LABELS = { 1: 'I', 2: 'II', 3: 'III' };

function GemDot({ type, count }) {
  const cfg = GEM_CONFIG[type];
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className={`w-3 h-3 rounded-full border ${cfg.dot} border-white/20 inline-block`} />
      <span className="text-gray-300">{count}</span>
    </div>
  );
}

/**
 * CardDisplay — muestra una carta de desarrollo.
 * Props:
 *   card        — objeto carta
 *   multiplier  — multiplicador actual del mercado (solo visual)
 *   effectiveCost — costo efectivo calculado (ya con bonuses y multiplicador)
 *   canAfford   — boolean
 *   onClick     — función al hacer clic
 *   mode        — 'buy' | 'reserve' | 'view'
 *   isReserved  — boolean (carta en mano reservada)
 */
export default function CardDisplay({ card, multiplier = 1.0, effectiveCost, canAfford = false, onClick, mode = 'view', isReserved = false }) {
  if (!card) return (
    <div className="flex h-40 w-[6.75rem] items-center justify-center rounded-lg border border-dashed border-gray-700 sm:w-28">
      <span className="text-gray-600 text-xs">Vacío</span>
    </div>
  );

  const tierStyle  = TIER_STYLES[card.tier] || TIER_STYLES[1];
  const gemCfg     = GEM_CONFIG[card.gem];
  const isPriceUp  = multiplier > 1.0;
  const isPriceDown= multiplier < 1.0;

  const displayCost = effectiveCost || card.cost;

  const borderGlow = canAfford && mode !== 'view'
    ? 'ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-900/40'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        relative h-40 w-[6.75rem] rounded-lg border bg-gradient-to-b ${tierStyle} ${borderGlow}
        flex flex-col justify-between p-2 cursor-pointer
        transition-all duration-200 hover:scale-105 hover:brightness-110 select-none sm:w-28
        ${onClick ? 'active:scale-95' : ''}
      `}
    >
      {/* Header: tier + prestige */}
      <div className="flex items-start justify-between">
        <span className="text-gray-500 text-[10px] font-bold">Niv {TIER_LABELS[card.tier]}</span>
        {card.prestige > 0 && (
          <span className="text-yellow-300 font-bold text-sm leading-none">{card.prestige}✦</span>
        )}
      </div>

      {/* Gem bonus */}
      <div className="flex justify-center">
        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${gemCfg.tw}`}>
          {gemCfg.emoji} +1
        </span>
      </div>

      {/* Indicador de precio del mercado */}
      {multiplier !== 1.0 && !isReserved && (
        <div className={`absolute top-1 right-1 text-[9px] font-bold rounded px-1 ${isPriceUp ? 'bg-red-900 text-red-300' : 'bg-emerald-900 text-emerald-300'}`}>
          {isPriceUp ? `×${multiplier.toFixed(2)}` : `×${multiplier.toFixed(2)}`}
        </div>
      )}

      {/* Costo */}
      <div className="space-y-0.5">
        {Object.entries(displayCost).map(([gem, amount]) => {
          const base  = card.cost[gem] || 0;
          const isAdj = amount !== base;
          return (
            <div key={gem} className={`flex items-center gap-1 text-[11px] font-semibold ${isAdj && isPriceUp ? 'text-red-400' : isAdj && isPriceDown ? 'text-emerald-400' : 'text-gray-200'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${GEM_CONFIG[gem]?.dot || 'bg-gray-500'}`} />
              {amount}
              {isAdj && <span className="text-[9px] opacity-60 line-through text-gray-500">{base}</span>}
            </div>
          );
        })}
      </div>

      {/* Etiqueta de acción */}
      {mode !== 'view' && onClick && (
        <div className={`absolute bottom-0 left-0 right-0 rounded-b-lg text-center text-[9px] py-0.5 font-bold
          ${mode === 'buy'
            ? canAfford ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-800 text-gray-500'
            : 'bg-blue-800 text-blue-100'
          }`}>
          {mode === 'buy' ? (canAfford ? '✓ Comprar' : 'Sin fondos') : '📌 Reservar'}
        </div>
      )}
    </div>
  );
}
