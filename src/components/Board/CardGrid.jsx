import CardDisplay from './CardDisplay';

const TIER_HEADERS = {
  tier3: { label: 'Nivel III', color: 'text-purple-400', deck: '📚' },
  tier2: { label: 'Nivel II',  color: 'text-yellow-400', deck: '📚' },
  tier1: { label: 'Nivel I',   color: 'text-gray-400',   deck: '📚' },
};

/**
 * CardGrid — grilla completa de cartas del tablero (3 filas × 4 columnas).
 * Props:
 *   board         — state.board
 *   mode          — 'buy' | 'reserve' | 'view'
 *   multiplier    — multiplicador del mercado
 *   canAfford     — (card, mult) => boolean
 *   getEffCost    — (card, mult) => costObject
 *   onCardClick   — (card) => void
 */
export default function CardGrid({ board, mode = 'view', multiplier = 1.0, canAfford, getEffCost, onCardClick }) {
  return (
    <div className="space-y-4">
      {['tier3', 'tier2', 'tier1'].map(tierKey => {
        const tier   = board[tierKey];
        const header = TIER_HEADERS[tierKey];
        return (
          <div key={tierKey} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              {/* Indicador del mazo */}
              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 sm:h-40 sm:w-20 sm:flex-shrink-0 sm:flex-col sm:justify-center sm:gap-1 sm:px-2">
                <span className={`text-xs font-bold ${header.color}`}>{header.label}</span>
                <span className="text-xl sm:text-2xl">{header.deck}</span>
                <span className="text-gray-400 text-xs">{tier.deck.length} restantes</span>
              </div>

              {/* 4 cartas visibles */}
              <div className="grid grid-cols-2 justify-items-center gap-2 sm:grid-cols-4 sm:justify-items-start">
                {Array.from({ length: 4 }).map((_, i) => {
                  const card = tier.visible[i] || null;
                  const eff  = card && getEffCost ? getEffCost(card, multiplier) : card?.cost;
                  const can  = card && canAfford  ? canAfford(card, multiplier) : false;
                  return (
                    <CardDisplay
                      key={card?.id || `empty-${tierKey}-${i}`}
                      card={card}
                      multiplier={multiplier}
                      effectiveCost={eff}
                      canAfford={can}
                      mode={mode}
                      onClick={card && mode !== 'view' ? () => onCardClick?.(card) : undefined}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
