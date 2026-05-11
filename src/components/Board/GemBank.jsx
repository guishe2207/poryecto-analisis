import { GEM_TYPES, GEM_CONFIG } from '../../data/cards';

/**
 * GemBank — muestra el banco de gemas y permite seleccionarlas.
 *
 * Props:
 *   bank          — { diamond, sapphire, ... } stock del banco
 *   selectedGems  — { diamond, sapphire, ... } selección actual
 *   onToggleGem   — (gemType) => void
 *   onConfirmTake — () => void
 *   onCancel      — () => void
 *   active        — boolean (está en modo selección)
 */
export default function GemBank({ bank, selectedGems = {}, onToggleGem, onConfirmTake, onCancel, active }) {
  const totalSelected = Object.values(selectedGems).reduce((a, b) => a + b, 0);

  // Validar si la selección actual es legal
  function isSelectionValid() {
    const entries = Object.entries(selectedGems).filter(([, v]) => v > 0);
    if (entries.length === 0) return false;
    // Caso: tomar 2 del mismo (debe haber ≥4 en el banco)
    if (entries.length === 1) {
      const [gem, amt] = entries[0];
      return amt === 2 && (bank[gem] || 0) >= 4;
    }
    // Caso: tomar hasta 3 distintas (1 de cada una)
    return entries.length <= 3 && entries.every(([, v]) => v === 1);
  }

  function handleGemClick(gem) {
    if (!active || !onToggleGem) return;
    const current = selectedGems[gem] || 0;
    const inBank  = bank[gem] || 0;

    // Determinar cuántas de este color hay seleccionadas de otras gemas
    const otherSelected = Object.entries(selectedGems)
      .filter(([g]) => g !== gem)
      .reduce((s, [, v]) => s + v, 0);

    if (current === 0) {
      if (otherSelected === 0 && inBank >= 4) {
        // Puede seleccionar 2 del mismo (primer clic si banco ≥4)
        onToggleGem(gem);
      } else if (otherSelected < 3) {
        onToggleGem(gem);
      }
    } else {
      onToggleGem(gem); // deseleccionar / reducir
    }
  }

  const valid = isSelectionValid();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Banco de Gemas</div>
      <div className="flex gap-2 flex-wrap">
        {[...GEM_TYPES, 'gold'].map(gem => {
          const cfg      = GEM_CONFIG[gem];
          const count    = bank[gem] || 0;
          const selected = selectedGems[gem] || 0;
          const empty    = count === 0;

          return (
            <button
              key={gem}
              onClick={() => gem !== 'gold' && handleGemClick(gem)}
              disabled={!active || gem === 'gold' || empty}
              className={`
                relative flex flex-col items-center gap-1 rounded-lg p-2 border transition-all duration-150
                ${selected > 0 ? 'ring-2 ring-white scale-110' : ''}
                ${empty ? 'opacity-30 cursor-not-allowed' : active && gem !== 'gold' ? 'hover:brightness-125 cursor-pointer active:scale-95' : 'cursor-default'}
                ${cfg.tw}
              `}
            >
              <span className="text-lg leading-none">{cfg.emoji}</span>
              <span className="font-bold text-sm">{count}</span>
              <span className="text-[9px] opacity-70">{cfg.label.slice(0, 4)}</span>
              {selected > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-gray-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selected}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onConfirmTake}
            disabled={!valid}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all
              ${valid ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            ✓ Tomar {totalSelected > 0 ? `(${totalSelected})` : ''}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            ✕
          </button>
        </div>
      )}

      {active && (
        <p className="text-[10px] text-gray-500 mt-1">
          Hasta 3 gemas distintas, ó 2 iguales si hay ≥4 en banco
        </p>
      )}
    </div>
  );
}
