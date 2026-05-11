import { useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useNumericalMarket } from './hooks/useNumericalMarket';
import MathDashboard from './components/Dashboard/MathDashboard';
import CardGrid from './components/Board/CardGrid';
import GemBank from './components/Board/GemBank';
import NobleRow from './components/Board/NobleRow';
import PlayerPanel from './components/Player/PlayerPanel';
import CardDisplay from './components/Board/CardDisplay';

// ── Modos de acción del turno ─────────────────────────────────────────────────
const MODES = {
  IDLE:    'idle',
  GEMS:    'gems',
  BUY:     'buy',
  RESERVE: 'reserve',
};

export default function App() {
  const [mode, setMode]               = useState(MODES.IDLE);
  const [selectedGems, setSelectedGems] = useState({});
  const [playerNames]                 = useState(['Jugador 1', 'Jugador 2']);

  const {
    state, activePlayer, takeGems, buyCard, reserveCard, reset,
    canAfford, getEffectiveCost,
  } = useGameState(playerNames);

  // Datos matemáticos del jugador activo
  const marketData = useNumericalMarket(activePlayer);
  const { multiplier, marketStatus } = marketData;

  // ── Handlers de gemas ────────────────────────────────────────────────────────

  const handleToggleGem = useCallback((gem) => {
    setSelectedGems(prev => {
      const current = prev[gem] || 0;
      const total   = Object.values(prev).reduce((a, b) => a + b, 0);

      // Si ya está seleccionada esta gema, se quita
      if (current > 0) {
        const next = { ...prev };
        next[gem] = Math.max(0, current - 1);
        if (next[gem] === 0) delete next[gem];
        return next;
      }

      // Verificar si se está en modo "2 iguales"
      const otherTypes = Object.keys(prev).filter(g => g !== gem && (prev[g] || 0) > 0);
      if (otherTypes.length === 0 && total === 1 && (state.bank[gem] || 0) >= 4) {
        // Añadir segundo del mismo
        return { ...prev, [gem]: 2 };
      }

      // Tomar 1 distinta
      if (total < 3 && current === 0) {
        return { ...prev, [gem]: 1 };
      }
      return prev;
    });
  }, [state.bank]);

  const handleConfirmTake = useCallback(() => {
    if (Object.keys(selectedGems).length === 0) return;
    takeGems(selectedGems);
    setSelectedGems({});
    setMode(MODES.IDLE);
  }, [selectedGems, takeGems]);

  // ── Handlers de cartas ───────────────────────────────────────────────────────

  const handleCardClick = useCallback((card, fromReserved = false) => {
    if (mode === MODES.BUY) {
      if (canAfford(card, multiplier)) {
        buyCard(card, fromReserved, multiplier);
        setMode(MODES.IDLE);
      }
    } else if (mode === MODES.RESERVE) {
      reserveCard(card);
      setMode(MODES.IDLE);
    }
  }, [mode, canAfford, multiplier, buyCard, reserveCard]);

  const handleCancel = () => {
    setMode(MODES.IDLE);
    setSelectedGems({});
  };

  // ── Pantalla de victoria ─────────────────────────────────────────────────────

  if (state.phase === 'won') {
    const winner = state.players[state.winner];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-6 p-10 bg-gray-900 rounded-2xl border border-yellow-600 shadow-2xl shadow-yellow-900/30 max-w-lg">
          <div className="text-6xl">🏆</div>
          <h1 className="text-4xl font-bold text-yellow-300">¡{winner.name} gana!</h1>
          <p className="text-gray-400">{winner.prestige} puntos de prestigio · {winner.cards.length} cartas · {winner.nobles.length} nobles</p>
          <div className="bg-gray-800 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm text-gray-400">Historial de rendimiento:</p>
            <p className="font-mono text-emerald-400 text-sm">
              f(x) = [{winner.performanceHistory.join(', ')}]
            </p>
          </div>
          <button
            onClick={() => { reset(); setMode(MODES.IDLE); setSelectedGems({}); }}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl transition-all"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // ── Layout principal ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            <span className="text-emerald-400">Splendor</span>
            <span className="text-gray-500 text-sm ml-2">Mercado Inteligente · Análisis Numérico</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Ronda {state.roundNumber + 1}</span>
          <span className="text-gray-600">·</span>
          <span className={marketStatus.color}>{marketStatus.label}</span>
          <button
            onClick={() => { reset(); setMode(MODES.IDLE); setSelectedGems({}); }}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs text-gray-400 border border-gray-700"
          >
            ↺ Reiniciar
          </button>
        </div>
      </header>

      {/* Layout de dos columnas */}
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">

        {/* ── Columna izquierda: Dashboard Matemático ── */}
        <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-800 p-3">
          <MathDashboard marketData={marketData} playerName={activePlayer?.name} />
        </div>

        {/* ── Columna derecha: Tablero de juego ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Área del tablero (scrolleable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Nobles */}
            <NobleRow nobles={state.nobles} />

            {/* Cartas del tablero */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Tablero de Cartas</div>
              <CardGrid
                board={state.board}
                mode={mode === MODES.BUY ? 'buy' : mode === MODES.RESERVE ? 'reserve' : 'view'}
                multiplier={multiplier}
                canAfford={canAfford}
                getEffCost={getEffectiveCost}
                onCardClick={handleCardClick}
              />
            </div>

            {/* Banco de gemas */}
            <GemBank
              bank={state.bank}
              selectedGems={selectedGems}
              onToggleGem={handleToggleGem}
              onConfirmTake={handleConfirmTake}
              onCancel={handleCancel}
              active={mode === MODES.GEMS}
            />

            {/* Cartas reservadas del jugador activo (para comprar desde mano) */}
            {activePlayer?.reserved?.length > 0 && mode === MODES.BUY && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  Cartas Reservadas de {activePlayer.name} (click para comprar)
                </div>
                <div className="flex gap-2 flex-wrap">
                  {activePlayer.reserved.map(card => (
                    <CardDisplay
                      key={card.id}
                      card={card}
                      multiplier={1.0}
                      effectiveCost={getEffectiveCost(card, 1.0)}
                      canAfford={canAfford(card, 1.0)}
                      mode="buy"
                      isReserved
                      onClick={() => handleCardClick(card, true)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Barra de acciones ── */}
          <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Turno de:</span>
              <span className="text-sm font-bold text-emerald-400">{activePlayer?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${marketStatus.bg} ${marketStatus.color}`}>
                ×{multiplier.toFixed(2)} en cartas
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode(mode === MODES.GEMS ? MODES.IDLE : MODES.GEMS)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                  ${mode === MODES.GEMS
                    ? 'bg-emerald-700 border-emerald-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              >
                💎 Tomar Gemas
              </button>

              <button
                onClick={() => setMode(mode === MODES.BUY ? MODES.IDLE : MODES.BUY)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                  ${mode === MODES.BUY
                    ? 'bg-blue-700 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              >
                🛒 Comprar Carta
              </button>

              <button
                onClick={() => setMode(mode === MODES.RESERVE ? MODES.IDLE : MODES.RESERVE)}
                disabled={(activePlayer?.reserved?.length || 0) >= 3}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                  ${mode === MODES.RESERVE
                    ? 'bg-purple-700 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'}`}
              >
                📌 Reservar ({activePlayer?.reserved?.length || 0}/3)
              </button>
            </div>

            {mode !== MODES.IDLE && (
              <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                {mode === MODES.GEMS    && 'Haz clic en las gemas del banco que quieres tomar, luego confirma.'}
                {mode === MODES.BUY    && 'Haz clic en una carta del tablero (o reservada) para comprarla.'}
                {mode === MODES.RESERVE && 'Haz clic en una carta del tablero para reservarla (recibes 1 🟡 oro).'}
              </p>
            )}
          </div>

          {/* ── Paneles de jugadores ── */}
          <div className="border-t border-gray-800 grid grid-cols-2 gap-0">
            {state.players.map((player, i) => (
              <div key={i} className={`p-3 ${i === 0 ? 'border-r border-gray-800' : ''}`}>
                <PlayerPanel
                  player={player}
                  isActive={i === state.playerTurn}
                  multiplier={multiplier}
                  marketStatus={marketStatus}
                  pidx={i}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
