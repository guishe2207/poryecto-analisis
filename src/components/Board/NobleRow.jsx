import { GEM_CONFIG } from '../../data/cards';

function NobleCard({ noble }) {
  return (
    <div className="w-20 rounded-lg border border-yellow-600 bg-gradient-to-b from-amber-950 to-yellow-900 p-2 sm:w-24">
      <div className="text-yellow-300 font-bold text-sm text-center">Noble</div>
      <div className="text-yellow-200 text-xs text-center font-bold">{noble.prestige} ✦</div>
      <div className="border-t border-yellow-700 pt-1 space-y-0.5">
        {Object.entries(noble.requirement).map(([gem, amount]) => (
          <div key={gem} className="flex items-center gap-1 text-xs text-yellow-100">
            <span className={`w-2.5 h-2.5 rounded-full ${GEM_CONFIG[gem]?.dot || 'bg-gray-400'}`} />
            <span>×{amount} cartas</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NobleRow({ nobles }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
      <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">Nobles</div>
      {nobles.length === 0 && <span className="text-gray-600 text-xs italic">Ninguno disponible</span>}
      <div className="flex flex-wrap gap-2">
        {nobles.map(n => <NobleCard key={n.id} noble={n} />)}
      </div>
    </div>
  );
}
