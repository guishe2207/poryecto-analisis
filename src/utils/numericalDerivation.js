/**
 * DERIVACIÓN NUMÉRICA POR DIFERENCIAS FINITAS
 * ============================================
 * Variable independiente x  → número de turno del jugador
 * Paso h                    → 1 (diferencia de un turno al siguiente)
 * Variable dependiente f(x) → Índice de Rendimiento del jugador
 *
 * f(x) = W_P·prestige + W_C·cards + W_G·gems + W_N·nobles
 */

// ── Pesos del Índice de Rendimiento ──────────────────────────────────────────
const WEIGHTS = {
  prestige: 5,   // Cada punto de prestigio vale 5
  cards:    2,   // Cada carta comprada vale 2
  gems:     1,   // Cada gema en mano vale 1
  nobles:   8,   // Cada noble obtenido vale 8 (también da 3 de prestigio = +15 total)
};

const h = 1; // paso fijo: 1 turno

/**
 * Calcula f(x) = Índice de Rendimiento para un snapshot del jugador.
 * @param {{ prestige: number, cardCount: number, gemCount: number, nobleCount: number }} snapshot
 * @returns {number}
 */
export function calculatePerformanceIndex({ prestige = 0, cardCount = 0, gemCount = 0, nobleCount = 0 }) {
  return (
    WEIGHTS.prestige * prestige +
    WEIGHTS.cards    * cardCount +
    WEIGHTS.gems     * gemCount  +
    WEIGHTS.nobles   * nobleCount
  );
}

/**
 * DIFERENCIA HACIA ADELANTE
 * f'(x) ≈ [ f(x+h) - f(x) ] / h
 * Requiere datos en x y x+1.
 * @param {number[]} fHistory
 * @param {number} x índice del turno
 * @returns {number|null}
 */
export function forwardDifference(fHistory, x) {
  if (x + 1 >= fHistory.length) return null;
  return (fHistory[x + 1] - fHistory[x]) / h;
}

/**
 * DIFERENCIA HACIA ATRÁS
 * f'(x) ≈ [ f(x) - f(x-h) ] / h
 * Requiere datos en x y x-1. Es el método "en tiempo real" (no necesita datos futuros).
 * @param {number[]} fHistory
 * @param {number} x índice del turno
 * @returns {number|null}
 */
export function backwardDifference(fHistory, x) {
  if (x < 1 || x >= fHistory.length) return null;
  return (fHistory[x] - fHistory[x - 1]) / h;
}

/**
 * DIFERENCIA CENTRAL
 * f'(x) ≈ [ f(x+h) - f(x-h) ] / (2h)
 * Más precisa (error O(h²) vs O(h) de las otras dos). Requiere x-1 y x+1.
 * @param {number[]} fHistory
 * @param {number} x índice del turno
 * @returns {number|null}
 */
export function centralDifference(fHistory, x) {
  if (x < 1 || x + 1 >= fHistory.length) return null;
  return (fHistory[x + 1] - fHistory[x - 1]) / (2 * h);
}

/**
 * Calcula los tres métodos para el índice dado.
 * Usa el penúltimo punto para que la central también pueda calcularse
 * (ya que necesita datos anteriores y posteriores).
 * @param {number[]} fHistory
 * @returns {{ forward: number|null, backward: number|null, central: number|null, x: number }}
 */
export function computeCurrentDerivatives(fHistory) {
  const n = fHistory.length;
  if (n < 2) return { forward: null, backward: null, central: null, x: 0 };

  const lastIdx = n - 1;

  // Backward: se puede calcular para el turno más reciente
  const backward = backwardDifference(fHistory, lastIdx);

  // Forward del penúltimo punto (ya que lastIdx+1 no existe aún)
  const forward = lastIdx >= 1 ? forwardDifference(fHistory, lastIdx - 1) : null;

  // Central del penúltimo punto (puede ir de [lastIdx-2] a [lastIdx])
  const central = lastIdx >= 2 ? centralDifference(fHistory, lastIdx - 1) : null;

  return { forward, backward, central, x: lastIdx };
}

/**
 * Error de truncamiento de cada método respecto a la diferencia central (más exacta).
 * |E_forward | = |forward - central|
 * |E_backward| = |backward - central|
 */
export function computeApproximationErrors(derivatives) {
  const { forward, backward, central } = derivatives;
  if (central === null) return { forwardError: null, backwardError: null };
  return {
    forwardError:  forward  !== null ? Math.abs(forward  - central) : null,
    backwardError: backward !== null ? Math.abs(backward - central) : null,
  };
}

/**
 * Convierte la derivada backward (tiempo real) en un multiplicador de precios.
 *
 * f'(x) > 0 alto  → jugador "acelerando" → mercado ENCARECE las cartas (penalización)
 * f'(x) ≤ 0       → jugador estancado    → mercado ABARATA las cartas (ayuda)
 *
 * @param {number|null} derivative
 * @returns {number} multiplicador entre 0.65 y 1.6
 */
export function getPriceMultiplier(derivative) {
  if (derivative === null || derivative === undefined) return 1.0;
  if (derivative > 8)  return 1.60;   // Aceleración muy alta → penalización fuerte
  if (derivative > 4)  return 1.35;   // Aceleración alta → penalización moderada
  if (derivative > 1)  return 1.15;   // Aceleración leve → leve penalización
  if (derivative <= 0) return 0.65;   // Estancamiento/descenso → mercado favorece
  return 1.0;                          // Zona neutra (0 < deriv ≤ 1)
}

/**
 * Metadatos visuales del estado actual del mercado.
 */
export function getMarketStatus(multiplier) {
  if (multiplier >= 1.5)  return { label: '🔴 Mercado Hostil',    color: 'text-red-500',    bg: 'bg-red-950 border-red-800',    description: 'Tu rendimiento es demasiado alto. El mercado te penaliza.' };
  if (multiplier >= 1.25) return { label: '🟠 Mercado Tenso',     color: 'text-orange-400', bg: 'bg-orange-950 border-orange-800', description: 'Estás avanzando rápido. Los precios suben.' };
  if (multiplier >= 1.1)  return { label: '🟡 Mercado Activo',    color: 'text-yellow-400', bg: 'bg-yellow-950 border-yellow-800', description: 'Buen ritmo. Leve incremento de precios.' };
  if (multiplier <= 0.7)  return { label: '🟢 Mercado Favorable', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-800', description: 'Tu rendimiento cayó. El mercado te ayuda a recuperarte.' };
  return { label: '⚪ Mercado Neutral', color: 'text-gray-400', bg: 'bg-gray-900 border-gray-700', description: 'Rendimiento estable. Precios normales.' };
}

/**
 * Aplica el multiplicador a un objeto de costos, redondeando hacia arriba.
 * El jugador percibe los costos de las cartas × multiplicador.
 * @param {Object} baseCost e.g. { ruby: 3, sapphire: 2 }
 * @param {number} multiplier
 * @returns {Object}
 */
export function applyPriceMultiplier(baseCost, multiplier) {
  if (multiplier === 1.0) return baseCost;
  return Object.fromEntries(
    Object.entries(baseCost).map(([gem, amount]) => [gem, Math.ceil(amount * multiplier)])
  );
}

/**
 * Construye el array de datos para Recharts mostrando f(x) y las tres derivadas.
 */
export function buildChartData(fHistory) {
  return fHistory.map((fx, i) => {
    const point = { turno: i, fx };
    if (i >= 1) point.backward = backwardDifference(fHistory, i);
    if (i + 1 < fHistory.length) point.forward = forwardDifference(fHistory, i);
    if (i >= 1 && i + 1 < fHistory.length) point.central = centralDifference(fHistory, i);
    return point;
  });
}

/**
 * Construye el string de la fórmula aplicada para mostrar en el dashboard.
 */
export function buildFormulaStrings(fHistory) {
  const n = fHistory.length;
  if (n < 2) return { backward: 'Esperando turno 2…', forward: 'Esperando turno 2…', central: 'Esperando turno 3…' };

  const last = n - 1;
  const fLast  = fHistory[last];
  const fPrev  = fHistory[last - 1];
  const fPrev2 = last >= 2 ? fHistory[last - 2] : null;

  const bwd = ((fLast - fPrev) / h).toFixed(2);
  const fwd = last >= 2 ? ((fLast - fPrev) / h).toFixed(2) : '—';
  const cen = fPrev2 !== null ? ((fLast - fPrev2) / (2 * h)).toFixed(2) : '—';

  return {
    backward: `(f(${last}) - f(${last - 1})) / 1 = (${fLast} - ${fPrev}) / 1 = ${bwd}`,
    forward:  last >= 2
      ? `(f(${last}) - f(${last - 1})) / 1 ≈ ${fwd}  [aprox. desde n-1]`
      : 'Esperando turno 2…',
    central:  fPrev2 !== null
      ? `(f(${last}) - f(${last - 2})) / 2 = (${fLast} - ${fPrev2}) / 2 = ${cen}`
      : 'Esperando turno 3…',
  };
}
