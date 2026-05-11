import { useReducer, useCallback } from 'react';
import { TIER1_CARDS, TIER2_CARDS, TIER3_CARDS, ALL_NOBLES, GEM_TYPES } from '../data/cards';
import { calculatePerformanceIndex } from '../utils/numericalDerivation';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyGems() {
  return { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 };
}

function createPlayer(name) {
  return {
    name,
    gems: emptyGems(),
    cards: [],
    reserved: [],
    nobles: [],
    prestige: 0,
    performanceHistory: [0], // f(0) = 0 al inicio
  };
}

function getCardBonuses(player) {
  const bonuses = emptyGems();
  for (const card of player.cards) bonuses[card.gem]++;
  return bonuses;
}

// Costo efectivo: base × multiplicador (ceil) – bonuses de cartas
function getEffectiveCost(card, player, multiplier = 1.0) {
  const bonuses = getCardBonuses(player);
  const result = {};
  for (const [gem, amount] of Object.entries(card.cost)) {
    const adjusted = Math.ceil(amount * multiplier);
    const afterBonus = Math.max(0, adjusted - (bonuses[gem] || 0));
    if (afterBonus > 0) result[gem] = afterBonus;
  }
  return result;
}

function canAffordCard(card, player, multiplier = 1.0) {
  const cost = getEffectiveCost(card, player, multiplier);
  let goldNeeded = 0;
  for (const [gem, amount] of Object.entries(cost)) {
    const deficit = amount - (player.gems[gem] || 0);
    if (deficit > 0) goldNeeded += deficit;
  }
  return goldNeeded <= (player.gems.gold || 0);
}

function qualifiesForNoble(player, noble) {
  const bonuses = getCardBonuses(player);
  for (const [gem, required] of Object.entries(noble.requirement)) {
    if ((bonuses[gem] || 0) < required) return false;
  }
  return true;
}

function playerSnapshot(player) {
  return {
    prestige:   player.prestige,
    cardCount:  player.cards.length,
    gemCount:   GEM_TYPES.reduce((s, g) => s + (player.gems[g] || 0), 0),
    nobleCount: player.nobles.length,
  };
}

// ── Estado inicial ────────────────────────────────────────────────────────────

function createInitialState(playerNames) {
  const t1 = shuffle([...TIER1_CARDS]);
  const t2 = shuffle([...TIER2_CARDS]);
  const t3 = shuffle([...TIER3_CARDS]);
  const nobles = shuffle([...ALL_NOBLES]).slice(0, playerNames.length + 1);

  return {
    playerTurn: 0,           // índice del jugador activo
    roundNumber: 0,          // número de ronda
    phase: 'action',         // 'action' | 'won'
    winner: null,
    players: playerNames.map(createPlayer),
    bank: { diamond: 4, sapphire: 4, emerald: 4, ruby: 4, onyx: 4, gold: 5 },
    board: {
      tier3: { visible: t3.slice(0, 4), deck: t3.slice(4) },
      tier2: { visible: t2.slice(0, 4), deck: t2.slice(4) },
      tier1: { visible: t1.slice(0, 4), deck: t1.slice(4) },
    },
    nobles,
    lastAction: null,
    log: [],
  };
}

// ── Fin de turno (se ejecuta tras cada acción) ────────────────────────────────

function processTurnEnd(state) {
  let player = { ...state.players[state.playerTurn] };

  // 1. Verificar nobles
  const qualifiedNobles = state.nobles.filter(n => qualifiesForNoble(player, n));
  let newNobles = [...state.nobles];
  if (qualifiedNobles.length > 0) {
    const noble = qualifiedNobles[0]; // Otorgar el primero que aplique
    player = {
      ...player,
      nobles: [...player.nobles, noble],
      prestige: player.prestige + noble.prestige,
    };
    newNobles = newNobles.filter(n => n.id !== noble.id);
  }

  // 2. Actualizar historial de rendimiento f(x)
  const snap = playerSnapshot(player);
  const fx   = calculatePerformanceIndex(snap);
  player = { ...player, performanceHistory: [...player.performanceHistory, fx] };

  // 3. Actualizar jugadores
  const newPlayers = [...state.players];
  newPlayers[state.playerTurn] = player;

  // 4. Chequear victoria (15 puntos de prestigio)
  if (player.prestige >= 15) {
    return { ...state, players: newPlayers, nobles: newNobles, phase: 'won', winner: state.playerTurn };
  }

  // 5. Pasar turno al siguiente jugador
  const nextPlayer = (state.playerTurn + 1) % state.players.length;
  const newRound   = nextPlayer === 0 ? state.roundNumber + 1 : state.roundNumber;

  return {
    ...state,
    players: newPlayers,
    nobles: newNobles,
    playerTurn: nextPlayer,
    roundNumber: newRound,
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function gameReducer(state, action) {
  switch (action.type) {

    case 'TAKE_GEMS': {
      const { gems } = action; // { diamond: 1, ruby: 1, ... }
      const player   = state.players[state.playerTurn];
      const newBank  = { ...state.bank };
      const newGems  = { ...player.gems };

      for (const [gem, amt] of Object.entries(gems)) {
        newBank[gem]  -= amt;
        newGems[gem]  = (newGems[gem] || 0) + amt;
      }

      const newPlayers = [...state.players];
      newPlayers[state.playerTurn] = { ...player, gems: newGems };

      return processTurnEnd({
        ...state,
        bank: newBank,
        players: newPlayers,
        lastAction: { type: 'TAKE_GEMS', gems },
      });
    }

    case 'BUY_CARD': {
      const { card, fromReserved = false, multiplier = 1.0 } = action;
      const player = state.players[state.playerTurn];
      const cost   = getEffectiveCost(card, player, multiplier);

      // Descontar gemas (usar oro para el déficit)
      const newGems = { ...player.gems };
      const newBank = { ...state.bank };
      let goldUsed  = 0;

      for (const [gem, need] of Object.entries(cost)) {
        const have = newGems[gem] || 0;
        if (have >= need) {
          newGems[gem]  -= need;
          newBank[gem]  += need;
        } else {
          newBank[gem]  += have;
          goldUsed      += need - have;
          newGems[gem]   = 0;
        }
      }
      newGems.gold  = (newGems.gold || 0) - goldUsed;
      newBank.gold  += goldUsed;

      // Añadir carta al jugador
      let newCards    = [...player.cards, card];
      let newReserved = [...player.reserved];
      let newBoard    = { ...state.board };

      if (fromReserved) {
        newReserved = newReserved.filter(c => c.id !== card.id);
      } else {
        const tierKey = `tier${card.tier}`;
        const tier    = state.board[tierKey];
        const idx     = tier.visible.findIndex(c => c.id === card.id);
        const vis     = [...tier.visible];

        if (tier.deck.length > 0) {
          vis[idx] = tier.deck[0];
          newBoard = { ...newBoard, [tierKey]: { visible: vis, deck: tier.deck.slice(1) } };
        } else {
          vis.splice(idx, 1);
          newBoard = { ...newBoard, [tierKey]: { visible: vis, deck: [] } };
        }
      }

      const newPlayers = [...state.players];
      newPlayers[state.playerTurn] = {
        ...player,
        gems: newGems,
        cards: newCards,
        reserved: newReserved,
        prestige: player.prestige + card.prestige,
      };

      return processTurnEnd({
        ...state,
        bank: newBank,
        board: newBoard,
        players: newPlayers,
        lastAction: { type: 'BUY_CARD', card },
      });
    }

    case 'RESERVE_CARD': {
      const { card } = action;
      const player   = state.players[state.playerTurn];
      if (player.reserved.length >= 3) return state;

      // Retirar del tablero
      const tierKey = `tier${card.tier}`;
      const tier    = state.board[tierKey];
      const idx     = tier.visible.findIndex(c => c.id === card.id);
      const vis     = [...tier.visible];

      let newBoard = { ...state.board };
      if (tier.deck.length > 0) {
        vis[idx] = tier.deck[0];
        newBoard = { ...newBoard, [tierKey]: { visible: vis, deck: tier.deck.slice(1) } };
      } else {
        vis.splice(idx, 1);
        newBoard = { ...newBoard, [tierKey]: { visible: vis, deck: [] } };
      }

      // Dar 1 oro si hay en el banco
      const newGems = { ...player.gems };
      const newBank = { ...state.bank };
      if (newBank.gold > 0) {
        newGems.gold = (newGems.gold || 0) + 1;
        newBank.gold--;
      }

      const newPlayers = [...state.players];
      newPlayers[state.playerTurn] = {
        ...player,
        gems: newGems,
        reserved: [...player.reserved, card],
      };

      return processTurnEnd({
        ...state,
        bank: newBank,
        board: newBoard,
        players: newPlayers,
        lastAction: { type: 'RESERVE_CARD', card },
      });
    }

    case 'RESET':
      return createInitialState(action.playerNames);

    default:
      return state;
  }
}

// ── Hook público ──────────────────────────────────────────────────────────────

export function useGameState(playerNames = ['Jugador 1', 'Jugador 2']) {
  const [state, dispatch] = useReducer(gameReducer, playerNames, createInitialState);

  const takeGems    = useCallback((gems) => dispatch({ type: 'TAKE_GEMS', gems }), []);
  const buyCard     = useCallback((card, fromReserved, multiplier) =>
    dispatch({ type: 'BUY_CARD', card, fromReserved, multiplier }), []);
  const reserveCard = useCallback((card) => dispatch({ type: 'RESERVE_CARD', card }), []);
  const reset       = useCallback((names = playerNames) => dispatch({ type: 'RESET', playerNames: names }), [playerNames]);

  const activePlayer = state.players[state.playerTurn];

  return {
    state,
    dispatch,
    activePlayer,
    takeGems,
    buyCard,
    reserveCard,
    reset,
    // Helpers exportados para los componentes
    getCardBonuses:  (pidx) => getCardBonuses(state.players[pidx]),
    canAfford:       (card, mult = 1.0) => canAffordCard(card, activePlayer, mult),
    getEffectiveCost:(card, mult = 1.0) => getEffectiveCost(card, activePlayer, mult),
  };
}
