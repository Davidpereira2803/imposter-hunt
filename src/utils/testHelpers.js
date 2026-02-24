/**
 * Generate test game state
 */
export const createTestGameState = (options = {}) => {
  const {
    playerCount = 5,
    includeJester = false,
    includeSheriff = false,
  } = options;

  const players = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);
  const imposterIndex = Math.floor(Math.random() * playerCount);
  
  let jesterIndex = null;
  let sheriffIndex = null;

  if (includeJester && playerCount >= 4) {
    do {
      jesterIndex = Math.floor(Math.random() * playerCount);
    } while (jesterIndex === imposterIndex);
  }

  if (includeSheriff && playerCount >= 4) {
    do {
      sheriffIndex = Math.floor(Math.random() * playerCount);
    } while (sheriffIndex === imposterIndex || sheriffIndex === jesterIndex);
  }

  return {
    players,
    imposterIndex,
    jesterIndex,
    sheriffIndex,
    secretWord: "TestWord",
    topicKey: "test-topic",
    currentRound: 1,
    eliminatedPlayers: [],
    sheriffHasInspected: false,
  };
};

/**
 * Check win conditions
 */
export const checkWinCondition = (gameState) => {
  const {
    players,
    imposterIndex,
    jesterIndex,
    eliminatedPlayers,
  } = gameState;

  const activePlayers = players.filter((_, idx) => !eliminatedPlayers.includes(idx));
  const isImposterEliminated = eliminatedPlayers.includes(imposterIndex);
  const isJesterEliminated = jesterIndex !== null && eliminatedPlayers.includes(jesterIndex);

  // Jester wins if eliminated
  if (isJesterEliminated) {
    return { winner: 'jester', reason: 'Jester was eliminated' };
  }

  // Civilians win if imposter eliminated
  if (isImposterEliminated) {
    return { winner: 'civilians', reason: 'Imposter was eliminated' };
  }

  // Imposter wins if only 2 players remain
  if (activePlayers.length <= 2) {
    return { winner: 'imposter', reason: 'Only 2 players remain' };
  }

  return { winner: null, reason: 'Game continues' };
};

/**
 * Clean word for comparison (same logic as imposter-guess.js)
 */
export const cleanWord = (s) => {
  if (!s) return "";
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};