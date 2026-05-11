import { useCallback, useState } from 'react';
import MathDashboard from './components/Dashboard/MathDashboard';
import CardGrid from './components/Board/CardGrid';
import GemBank from './components/Board/GemBank';
import NobleRow from './components/Board/NobleRow';
import PlayerPanel from './components/Player/PlayerPanel';
import CardDisplay from './components/Board/CardDisplay';
import { useGameState } from './hooks/useGameState';
import { useNumericalMarket } from './hooks/useNumericalMarket';

const MODES = {
  IDLE: 'idle',
  GEMS: 'gems',
  BUY: 'buy',
  RESERVE: 'reserve',
};

const MOBILE_VIEWS = {
  BOARD: 'board',
  DASHBOARD: 'dashboard',
  PLAYERS: 'players',
};

export default function App() {
  const [mode, setMode] = useState(MODES.IDLE);
  const [selectedGems, setSelectedGems] = useState({});
  const [playerNames] = useState(['Jugador 1', 'Jugador 2']);
  const [mobileView, setMobileView] = useState(MOBILE_VIEWS.BOARD);

  const {
    state,
    activePlayer,
    takeGems,
    buyCard,
    reserveCard,
    reset,
    canAfford,
    getEffectiveCost,
  } = useGameState(playerNames);

  const marketData = useNumericalMarket(activePlayer);
  const { multiplier, marketStatus } = marketData;

  const handleToggleGem = useCallback((gem) => {
    setSelectedGems((prev) => {
      const current = prev[gem] || 0;
      const total = Object.values(prev).reduce((sum, value) => sum + value, 0);

      if (current > 0) {
        const next = { ...prev };
        next[gem] = Math.max(0, current - 1);
        if (next[gem] === 0) delete next[gem];
        return next;
      }

      const otherTypes = Object.keys(prev).filter((type) => type !== gem && (prev[type] || 0) > 0);
      if (otherTypes.length === 0 && total === 1 && (state.bank[gem] || 0) >= 4) {
        return { ...prev, [gem]: 2 };
      }

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
    setMobileView(MOBILE_VIEWS.BOARD);
  }, [selectedGems, takeGems]);

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
  }, [buyCard, canAfford, mode, multiplier, reserveCard]);

  const handleCancel = useCallback(() => {
    setMode(MODES.IDLE);
    setSelectedGems({});
  }, []);

  const handleModeToggle = useCallback((nextMode) => {
    const resolvedMode = mode === nextMode ? MODES.IDLE : nextMode;
    if (resolvedMode !== MODES.GEMS) {
      setSelectedGems({});
    }
    setMode(resolvedMode);
    setMobileView(MOBILE_VIEWS.BOARD);
  }, [mode]);

  const handleResetGame = useCallback(() => {
    reset();
    setMode(MODES.IDLE);
    setSelectedGems({});
    setMobileView(MOBILE_VIEWS.BOARD);
  }, [reset]);

  const renderBoardSection = () => (
    <div className="space-y-4">
      <NobleRow nobles={state.nobles} />

      <div>
        <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">Tablero de Cartas</div>
        <CardGrid
          board={state.board}
          mode={mode === MODES.BUY ? 'buy' : mode === MODES.RESERVE ? 'reserve' : 'view'}
          multiplier={multiplier}
          canAfford={canAfford}
          getEffCost={getEffectiveCost}
          onCardClick={handleCardClick}
        />
      </div>

      <GemBank
        bank={state.bank}
        selectedGems={selectedGems}
        onToggleGem={handleToggleGem}
        onConfirmTake={handleConfirmTake}
        onCancel={handleCancel}
        active={mode === MODES.GEMS}
      />

      {activePlayer?.reserved?.length > 0 && mode === MODES.BUY && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
          <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">
            Cartas Reservadas de {activePlayer.name} (click para comprar)
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {activePlayer.reserved.map((card) => (
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
  );

  const renderActionBar = () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Turno de:</span>
        <span className="text-sm font-bold text-emerald-400">{activePlayer?.name}</span>
        <span className={`rounded-full border px-2 py-0.5 text-xs ${marketStatus.bg} ${marketStatus.color}`}>
          x{multiplier.toFixed(2)} en cartas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          onClick={() => handleModeToggle(MODES.GEMS)}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-all ${
            mode === MODES.GEMS
              ? 'border-emerald-500 bg-emerald-700 text-white'
              : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Tomar Gemas
        </button>

        <button
          onClick={() => handleModeToggle(MODES.BUY)}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-all ${
            mode === MODES.BUY
              ? 'border-blue-500 bg-blue-700 text-white'
              : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Comprar Carta
        </button>

        <button
          onClick={() => handleModeToggle(MODES.RESERVE)}
          disabled={(activePlayer?.reserved?.length || 0) >= 3}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-all ${
            mode === MODES.RESERVE
              ? 'border-purple-500 bg-purple-700 text-white'
              : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          Reservar ({activePlayer?.reserved?.length || 0}/3)
        </button>
      </div>

      {mode !== MODES.IDLE && (
        <p className="text-center text-[11px] text-gray-500">
          {mode === MODES.GEMS && 'Haz clic en las gemas del banco que quieres tomar, luego confirma.'}
          {mode === MODES.BUY && 'Haz clic en una carta del tablero o en una reservada para comprarla.'}
          {mode === MODES.RESERVE && 'Haz clic en una carta del tablero para reservarla. Si hay oro, lo recibes.'}
        </p>
      )}
    </div>
  );

  const renderPlayersSection = (gridClassName = 'grid-cols-1') => (
    <div className={`grid gap-3 ${gridClassName}`}>
      {state.players.map((player, index) => (
        <PlayerPanel
          key={index}
          player={player}
          isActive={index === state.playerTurn}
          multiplier={multiplier}
          marketStatus={marketStatus}
          pidx={index}
        />
      ))}
    </div>
  );

  if (state.phase === 'won') {
    const winner = state.players[state.winner];
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="mx-4 w-full max-w-lg space-y-6 rounded-2xl border border-yellow-600 bg-gray-900 p-6 text-center shadow-2xl shadow-yellow-900/30 sm:p-10">
          <div className="text-5xl sm:text-6xl">🏆</div>
          <h1 className="text-3xl font-bold text-yellow-300 sm:text-4xl">¡{winner.name} gana!</h1>
          <p className="text-sm text-gray-400 sm:text-base">
            {winner.prestige} puntos de prestigio · {winner.cards.length} cartas · {winner.nobles.length} nobles
          </p>
          <div className="space-y-2 rounded-xl bg-gray-800 p-4 text-left">
            <p className="text-sm text-gray-400">Historial de rendimiento:</p>
            <p className="font-mono text-sm text-emerald-400">
              f(x) = [{winner.performanceHistory.join(', ')}]
            </p>
          </div>
          <button
            onClick={handleResetGame}
            className="rounded-xl bg-yellow-600 px-8 py-3 font-bold text-black transition-all hover:bg-yellow-500"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex flex-col gap-1 text-white sm:flex-row sm:items-baseline">
              <span className="text-lg font-bold text-emerald-400">Splendor</span>
              <span className="text-xs text-gray-500 sm:ml-2 sm:text-sm">Mercado Inteligente - Analisis Numerico</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400 sm:text-sm">
            <span>Ronda {state.roundNumber + 1}</span>
            <span className="hidden text-gray-600 sm:inline">·</span>
            <span className={marketStatus.color}>{marketStatus.label}</span>
            <button
              onClick={handleResetGame}
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-400 hover:bg-gray-700"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </header>

      <div className="xl:hidden">
        <div className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/95 px-4 py-3 backdrop-blur">
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-800 bg-gray-900 p-1">
            {[
              { id: MOBILE_VIEWS.BOARD, label: 'Juego' },
              { id: MOBILE_VIEWS.DASHBOARD, label: 'Analisis' },
              { id: MOBILE_VIEWS.PLAYERS, label: 'Jugadores' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setMobileView(view.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mobileView === view.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900 px-3 py-3">
            {renderActionBar()}
          </div>
        </div>

        <div className="space-y-4 p-4">
          {mobileView === MOBILE_VIEWS.BOARD && renderBoardSection()}
          {mobileView === MOBILE_VIEWS.DASHBOARD && (
            <MathDashboard marketData={marketData} playerName={activePlayer?.name} />
          )}
          {mobileView === MOBILE_VIEWS.PLAYERS && renderPlayersSection()}
        </div>
      </div>

      <div className="hidden xl:flex xl:h-[calc(100vh-73px)] xl:overflow-hidden">
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-800 p-3">
          <MathDashboard marketData={marketData} playerName={activePlayer?.name} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {renderBoardSection()}
          </div>

          <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
            {renderActionBar()}
          </div>

          <div className="overflow-y-auto border-t border-gray-800 p-3">
            {renderPlayersSection('grid-cols-2')}
          </div>
        </div>
      </div>
    </div>
  );
}
