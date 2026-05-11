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
    <div className="space-y-3">
      {['tier3', 'tier2', 'tier1'].map(tierKey => {
        const tier   = board[tierKey];
        const header = TIER_HEADERS[tierKey];
        return (
          <div key={tierKey} className="flex items-start gap-2">
            {/* Indicador del mazo */}
            <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center bg-gray-900 border border-gray-700 rounded-lg h-40 gap-1">
              <span className={`text-xs font-bold ${header.color}`}>{header.label}</span>
              <span className="text-2xl">{header.deck}</span>
              <span className="text-gray-400 text-xs">{tier.deck.length} restantes</span>
            </div>

            {/* 4 cartas visibles */}
            <div className="flex gap-2 flex-wrap">
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
        );
      })}
    </div>
  );
}
