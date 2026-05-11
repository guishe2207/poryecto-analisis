export const GEM_TYPES = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx'];

export const GEM_CONFIG = {
  diamond:  { label: 'Diamante', emoji: '♦', tw: 'bg-slate-200 text-gray-900 border-slate-300', dot: 'bg-slate-200' },
  sapphire: { label: 'Zafiro',   emoji: '♦', tw: 'bg-blue-600 text-white border-blue-400',     dot: 'bg-blue-500' },
  emerald:  { label: 'Esmeralda',emoji: '♦', tw: 'bg-emerald-600 text-white border-emerald-400', dot: 'bg-emerald-500' },
  ruby:     { label: 'Rubí',     emoji: '♦', tw: 'bg-red-600 text-white border-red-400',        dot: 'bg-red-500' },
  onyx:     { label: 'Ónice',   emoji: '♦', tw: 'bg-gray-700 text-white border-gray-500',      dot: 'bg-gray-600' },
  gold:     { label: 'Oro',      emoji: '★', tw: 'bg-yellow-400 text-gray-900 border-yellow-300', dot: 'bg-yellow-400' },
};

// ──────────── NIVEL 1 (20 cartas) ────────────
export const TIER1_CARDS = [
  { id: 'l1_01', tier: 1, gem: 'onyx',     prestige: 0, cost: { sapphire: 1, emerald: 1, ruby: 1, diamond: 1 } },
  { id: 'l1_02', tier: 1, gem: 'onyx',     prestige: 0, cost: { sapphire: 2, ruby: 1 } },
  { id: 'l1_03', tier: 1, gem: 'onyx',     prestige: 0, cost: { diamond: 1, ruby: 2, sapphire: 1 } },
  { id: 'l1_04', tier: 1, gem: 'onyx',     prestige: 0, cost: { onyx: 1, ruby: 3 } },
  { id: 'l1_05', tier: 1, gem: 'diamond',  prestige: 0, cost: { onyx: 1, emerald: 1, ruby: 1, sapphire: 1 } },
  { id: 'l1_06', tier: 1, gem: 'diamond',  prestige: 0, cost: { onyx: 2, emerald: 1 } },
  { id: 'l1_07', tier: 1, gem: 'diamond',  prestige: 0, cost: { ruby: 1, emerald: 2, onyx: 1 } },
  { id: 'l1_08', tier: 1, gem: 'diamond',  prestige: 0, cost: { ruby: 2, onyx: 1 } },
  { id: 'l1_09', tier: 1, gem: 'sapphire', prestige: 0, cost: { diamond: 1, onyx: 1, ruby: 1, emerald: 1 } },
  { id: 'l1_10', tier: 1, gem: 'sapphire', prestige: 0, cost: { onyx: 1, ruby: 1, emerald: 2 } },
  { id: 'l1_11', tier: 1, gem: 'sapphire', prestige: 0, cost: { diamond: 1, ruby: 1, emerald: 1 } },
  { id: 'l1_12', tier: 1, gem: 'sapphire', prestige: 0, cost: { onyx: 4 } },
  { id: 'l1_13', tier: 1, gem: 'emerald',  prestige: 0, cost: { sapphire: 2, diamond: 2 } },
  { id: 'l1_14', tier: 1, gem: 'emerald',  prestige: 0, cost: { sapphire: 1, onyx: 1, ruby: 2 } },
  { id: 'l1_15', tier: 1, gem: 'emerald',  prestige: 0, cost: { diamond: 3, sapphire: 1 } },
  { id: 'l1_16', tier: 1, gem: 'ruby',     prestige: 0, cost: { sapphire: 2, emerald: 1 } },
  { id: 'l1_17', tier: 1, gem: 'ruby',     prestige: 0, cost: { diamond: 2, sapphire: 1, onyx: 1 } },
  { id: 'l1_18', tier: 1, gem: 'onyx',     prestige: 1, cost: { ruby: 4 } },
  { id: 'l1_19', tier: 1, gem: 'diamond',  prestige: 1, cost: { onyx: 4 } },
  { id: 'l1_20', tier: 1, gem: 'sapphire', prestige: 1, cost: { emerald: 3, onyx: 1 } },
];

// ──────────── NIVEL 2 (16 cartas) ────────────
export const TIER2_CARDS = [
  { id: 'l2_01', tier: 2, gem: 'onyx',     prestige: 1, cost: { sapphire: 3, ruby: 2, onyx: 2 } },
  { id: 'l2_02', tier: 2, gem: 'onyx',     prestige: 2, cost: { onyx: 5 } },
  { id: 'l2_03', tier: 2, gem: 'onyx',     prestige: 2, cost: { diamond: 3, sapphire: 3, onyx: 2 } },
  { id: 'l2_04', tier: 2, gem: 'diamond',  prestige: 1, cost: { onyx: 3, emerald: 2, diamond: 2 } },
  { id: 'l2_05', tier: 2, gem: 'diamond',  prestige: 2, cost: { diamond: 5 } },
  { id: 'l2_06', tier: 2, gem: 'diamond',  prestige: 2, cost: { ruby: 3, emerald: 3, diamond: 2 } },
  { id: 'l2_07', tier: 2, gem: 'sapphire', prestige: 1, cost: { emerald: 3, diamond: 2, sapphire: 2 } },
  { id: 'l2_08', tier: 2, gem: 'sapphire', prestige: 2, cost: { sapphire: 5 } },
  { id: 'l2_09', tier: 2, gem: 'emerald',  prestige: 1, cost: { ruby: 3, sapphire: 2, emerald: 2 } },
  { id: 'l2_10', tier: 2, gem: 'emerald',  prestige: 2, cost: { emerald: 5 } },
  { id: 'l2_11', tier: 2, gem: 'ruby',     prestige: 1, cost: { diamond: 3, onyx: 2, ruby: 2 } },
  { id: 'l2_12', tier: 2, gem: 'ruby',     prestige: 2, cost: { ruby: 5 } },
  { id: 'l2_13', tier: 2, gem: 'onyx',     prestige: 3, cost: { diamond: 3, sapphire: 3, emerald: 3, onyx: 5 } },
  { id: 'l2_14', tier: 2, gem: 'ruby',     prestige: 3, cost: { diamond: 3, sapphire: 3, ruby: 5 } },
  { id: 'l2_15', tier: 2, gem: 'emerald',  prestige: 2, cost: { onyx: 4, diamond: 2 } },
  { id: 'l2_16', tier: 2, gem: 'sapphire', prestige: 3, cost: { ruby: 3, onyx: 3, sapphire: 5 } },
];

// ──────────── NIVEL 3 (12 cartas) ────────────
export const TIER3_CARDS = [
  { id: 'l3_01', tier: 3, gem: 'onyx',     prestige: 3, cost: { diamond: 3, sapphire: 3, emerald: 3, ruby: 5 } },
  { id: 'l3_02', tier: 3, gem: 'diamond',  prestige: 4, cost: { sapphire: 7 } },
  { id: 'l3_03', tier: 3, gem: 'diamond',  prestige: 4, cost: { diamond: 3, sapphire: 6, emerald: 3 } },
  { id: 'l3_04', tier: 3, gem: 'sapphire', prestige: 4, cost: { emerald: 7 } },
  { id: 'l3_05', tier: 3, gem: 'sapphire', prestige: 5, cost: { diamond: 3, onyx: 7 } },
  { id: 'l3_06', tier: 3, gem: 'emerald',  prestige: 4, cost: { ruby: 7 } },
  { id: 'l3_07', tier: 3, gem: 'emerald',  prestige: 5, cost: { sapphire: 3, ruby: 7 } },
  { id: 'l3_08', tier: 3, gem: 'ruby',     prestige: 4, cost: { onyx: 7 } },
  { id: 'l3_09', tier: 3, gem: 'ruby',     prestige: 5, cost: { emerald: 7, diamond: 3 } },
  { id: 'l3_10', tier: 3, gem: 'onyx',     prestige: 5, cost: { sapphire: 7, diamond: 3 } },
  { id: 'l3_11', tier: 3, gem: 'diamond',  prestige: 3, cost: { sapphire: 3, emerald: 3, ruby: 6 } },
  { id: 'l3_12', tier: 3, gem: 'ruby',     prestige: 3, cost: { diamond: 5, onyx: 3, emerald: 3 } },
];

// ──────────── NOBLES (10 tiles) ────────────
export const ALL_NOBLES = [
  { id: 'n01', prestige: 3, requirement: { diamond: 4, sapphire: 4 } },
  { id: 'n02', prestige: 3, requirement: { diamond: 3, sapphire: 3, onyx: 3 } },
  { id: 'n03', prestige: 3, requirement: { ruby: 4, emerald: 4 } },
  { id: 'n04', prestige: 3, requirement: { ruby: 4, onyx: 4 } },
  { id: 'n05', prestige: 3, requirement: { emerald: 3, sapphire: 3, ruby: 3 } },
  { id: 'n06', prestige: 3, requirement: { onyx: 4, diamond: 4 } },
  { id: 'n07', prestige: 3, requirement: { diamond: 3, emerald: 3, ruby: 3 } },
  { id: 'n08', prestige: 3, requirement: { sapphire: 4, emerald: 4 } },
  { id: 'n09', prestige: 3, requirement: { onyx: 3, diamond: 3, sapphire: 3 } },
  { id: 'n10', prestige: 3, requirement: { ruby: 3, onyx: 3, emerald: 3 } },
];
