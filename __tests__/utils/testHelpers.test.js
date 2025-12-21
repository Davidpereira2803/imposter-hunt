import { createTestGameState, checkWinCondition, cleanWord } from '../../src/utils/testHelpers';

describe('Test Helpers', () => {
  describe('createTestGameState', () => {
    it('should create basic game state', () => {
      const state = createTestGameState({ playerCount: 5 });
      
      expect(state.players).toHaveLength(5);
      expect(state.imposterIndex).toBeGreaterThanOrEqual(0);
      expect(state.imposterIndex).toBeLessThan(5);
      expect(state.secretWord).toBe('TestWord');
      expect(state.currentRound).toBe(1);
      expect(state.eliminatedPlayers).toEqual([]);
    });

    it('should not assign jester with less than 4 players', () => {
      const state = createTestGameState({ 
        playerCount: 3, 
        includeJester: true 
      });
      
      expect(state.jesterIndex).toBeNull();
    });

    it('should assign jester with 4+ players', () => {
      const state = createTestGameState({ 
        playerCount: 4, 
        includeJester: true 
      });
      
      expect(state.jesterIndex).not.toBeNull();
      expect(state.jesterIndex).not.toBe(state.imposterIndex);
    });
  });

  describe('checkWinCondition', () => {
    it('should detect civilian win', () => {
      const state = createTestGameState({ playerCount: 5 });
      state.eliminatedPlayers = [state.imposterIndex];
      
      const result = checkWinCondition(state);
      expect(result.winner).toBe('civilians');
    });

    it('should detect imposter win (2 players remain)', () => {
      const state = createTestGameState({ playerCount: 5 });
      const toEliminate = [0, 1, 2, 3, 4]
        .filter(i => i !== state.imposterIndex)
        .slice(0, 3);
      state.eliminatedPlayers = toEliminate;
      
      const result = checkWinCondition(state);
      expect(result.winner).toBe('imposter');
    });

    it('should detect jester win', () => {
      const state = createTestGameState({ 
        playerCount: 5, 
        includeJester: true 
      });
      state.eliminatedPlayers = [state.jesterIndex];
      
      const result = checkWinCondition(state);
      expect(result.winner).toBe('jester');
    });
  });

  describe('cleanWord', () => {
    it('should match exact words', () => {
      expect(cleanWord('pizza')).toBe('pizza');
    });

    it('should handle case insensitivity', () => {
      expect(cleanWord('PIZZA')).toBe(cleanWord('pizza'));
    });

    it('should trim whitespace', () => {
      expect(cleanWord('  pizza  ')).toBe('pizza');
    });

    it('should handle accents', () => {
      expect(cleanWord('café')).toBe(cleanWord('cafe'));
    });

    it('should remove special characters', () => {
      expect(cleanWord('pizza!!!')).toBe('pizza');
    });

    it('should handle multi-word phrases', () => {
      expect(cleanWord('Solar Panel')).toBe('solar panel');
    });
  });
});