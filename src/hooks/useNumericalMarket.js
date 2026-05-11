import { useMemo } from 'react';
import {
  computeCurrentDerivatives,
  computeApproximationErrors,
  getPriceMultiplier,
  getMarketStatus,
  buildChartData,
  buildFormulaStrings,
} from '../utils/numericalDerivation';

/**
 * Hook que consume el historial de rendimiento de un jugador y devuelve
 * toda la información matemática necesaria para el Dashboard y el mercado.
 *
 * @param {Object} player - estado del jugador activo
 * @returns {Object} datos matemáticos completos
 */
export function useNumericalMarket(player) {
  return useMemo(() => {
    const fHistory = player?.performanceHistory ?? [0];
    const n = fHistory.length;

    // Calcular las tres derivadas en el punto más reciente disponible
    const derivatives = computeCurrentDerivatives(fHistory);
    const errors      = computeApproximationErrors(derivatives);

    // El multiplicador activo usa la diferencia hacia atrás (disponible en tiempo real)
    const multiplier   = getPriceMultiplier(derivatives.backward);
    const marketStatus = getMarketStatus(multiplier);

    // Datos para Recharts
    const chartData = buildChartData(fHistory);

    // Strings de fórmulas para el dashboard
    const formulas = buildFormulaStrings(fHistory);

    // Información del turno actual
    const currentFx     = fHistory[n - 1] ?? 0;
    const previousFx    = fHistory[n - 2] ?? null;
    const deltaFx       = previousFx !== null ? currentFx - previousFx : null;

    return {
      fHistory,
      currentFx,
      previousFx,
      deltaFx,
      derivatives,
      errors,
      multiplier,
      marketStatus,
      chartData,
      formulas,
      turnCount: n - 1, // turnos jugados (el índice 0 es el estado inicial)
    };
  }, [player?.performanceHistory]);
}
