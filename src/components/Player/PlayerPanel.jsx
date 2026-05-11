import { GEM_TYPES, GEM_CONFIG } from '../../data/cards';
import CardDisplay from '../Board/CardDisplay';

export default function PlayerPanel({ player, isActive, multiplier = 1.0, marketStatus, pidx }) {
  if (!player) return null;

  const bonuses = {};
  for (const card of player.cards) {
    bonuses[card.gem] = (bonuses[card.gem] || 0) + 1;
  }

  const totalGems = GEM_TYPES.reduce((s, g) => s + (player.gems[g] || 0), 0) + (player.gems.gold || 0);

  return (
    <div className={`rounded-xl border p-3 transition-all duration-300 ${
      isActive
        ? 'border-emerald-500 bg-gradient-to-br from-emerald-950/60 to-gray-900 shadow-lg shadow-emerald-900/30'
        : 'border-gray-700 bg-gray-900/60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isActive && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
          <span className="font-bold text-sm text-white">{player.name}</span>
          {isActive && <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded">Turno activo</span>}
        </div>
        <div className="text-right">
          <div className="text-yellow-300 font-bold text-lg leading-none">{player.prestige}</div>
          <div className="text-yellow-500 text-[10px]">✦ prestige</div>
        </div>
      </div>

      {/* Multiplicador del mercado (solo jugador activo) */}
      {isActive && (
        <div className={`mb-3 rounded-lg border p-2 text-center text-xs ${marketStatus.bg}`}>
          <div className={`font-bold ${marketStatus.color}`}>{marketStatus.label}</div>
          <div className="text-gray-400 text-[10px] mt-0.5">Multiplicador de precio: ×{multiplier.toFixed(2)}</div>
        </div>
      )}

      {/* Gemas en mano */}
      <div className="mb-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Gemas ({totalGems}/10)</div>
        <div className="flex gap-1 flex-wrap">
          {[...GEM_TYPES, 'gold'].map(gem => {
            const count = player.gems[gem] || 0;
            if (count === 0) return null;
            const cfg = GEM_CONFIG[gem];
            return (
              <div key={gem} className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${cfg.tw}`}>
                <span>{cfg.emoji}</span>
                <span className="font-bold">{count}</span>
              </div>
            );
          })}
          {totalGems === 0 && <span className="text-gray-600 text-xs italic">Sin gemas</span>}
        </div>
      </div>

      {/* Bonificaciones de cartas */}
      <div className="mb-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
          Cartas compradas ({player.cards.length}) — Bonificaciones:
        </div>
        <div className="flex gap-1 flex-wrap">
          {GEM_TYPES.map(gem => {
            const count = bonuses[gem] || 0;
            if (count === 0) return null;
            const cfg = GEM_CONFIG[gem];
            return (
              <div key={gem} className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${cfg.tw}`}>
                <span>{cfg.emoji}</span>
                <span className="font-bold">+{count}</span>
              </div>
            );
          })}
          {player.cards.length === 0 && <span className="text-gray-600 text-xs italic">Sin cartas</span>}
        </div>
      </div>

      {/* Nobles obtenidos */}
      {player.nobles.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Nobles ({player.nobles.length})</div>
          <div className="flex gap-1">
            {player.nobles.map(n => (
              <div key={n.id} className="bg-yellow-900 border border-yellow-600 rounded px-2 py-0.5 text-yellow-300 text-xs font-bold">
                {n.prestige}✦
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cartas reservadas */}
      {player.reserved.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reservadas ({player.reserved.length}/3)</div>
          <div className="flex gap-1 flex-wrap">
            {player.reserved.map(card => (
              <CardDisplay key={card.id} card={card} mode="view" isReserved />
            ))}
          </div>
        </div>
      )}

      {/* Mini historial de f(x) */}
      <div className="mt-2 pt-2 border-t border-gray-800">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">f(x) últimos turnos</div>
        <div className="flex gap-1 items-end h-8">
          {player.performanceHistory.slice(-8).map((v, i) => {
            const max = Math.max(...player.performanceHistory, 1);
            const pct = (v / max) * 100;
            return (
              <div
                key={i}
                title={`f(${i}) = ${v}`}
                className="flex-1 bg-emerald-600/70 rounded-sm min-h-[2px] transition-all duration-300"
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
