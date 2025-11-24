import { renderHook, act } from '@testing-library/react-native';
import { useGameStore } from '../src/store/gameStore';

describe('Game Store', () => {
  beforeEach(async () => {
    const { result } = renderHook(() => useGameStore());
    await act(async () => {
      result.current.resetMatch();
      result.current.setPlayers([]);
      result.current.setTopicKey('');
    });
  });

  describe('Player Management', () => {
    it('should set players', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie']);
      });

      expect(result.current.players).toHaveLength(3);
      expect(result.current.players).toEqual(['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('Topic Management', () => {
    it('should set topic key', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setTopicKey('Food');
      });

      expect(result.current.topicKey).toBe('Food');
    });

    it('should get topic by key', () => {
      const { result } = renderHook(() => useGameStore());
      
      const topic = result.current.getTopicByKey('Food');
      
      expect(topic).toBeDefined();
      expect(topic?.name).toBe('Food');
      expect(Array.isArray(topic?.words)).toBe(true);
      expect(topic?.isCustom).toBe(false);
    });

    it('should get all topics including custom', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.addCustomTopic({ 
          name: 'Custom Topic', 
          words: ['word1', 'word2', 'word3'] 
        });
      });

      const allTopics = result.current.getAllTopics();
      
      const customTopic = allTopics.find(t => t.name === 'Custom Topic');
      expect(customTopic).toBeDefined();
      expect(customTopic?.words).toEqual(['word1', 'word2', 'word3']);
      expect(customTopic?.isCustom).toBe(true);
    });

    it('should handle random topic', () => {
      const { result } = renderHook(() => useGameStore());
      
      const randomTopic = result.current.getTopicByKey('random');
      
      expect(randomTopic).toBeDefined();
      expect(randomTopic?.name).toBe('Random');
      expect(Array.isArray(randomTopic?.words)).toBe(true);
      expect(randomTopic?.words.length).toBeGreaterThan(0);
    });
  });

  describe('Game Start', () => {
    it('should not start game with less than 3 players', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob']);
        result.current.setTopicKey('Food');
      });

      const success = result.current.startMatch();
      expect(success).toBe(false);
    });

    it('should not start game without valid topic', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie']);
        result.current.setTopicKey('');
      });

      const success = result.current.startMatch();
      expect(success).toBe(false);
    });

    it('should start game with valid setup', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie']);
        result.current.setTopicKey('Food');
        result.current.startMatch();
      });

      expect(result.current.imposterIndex).not.toBeNull();
      expect(result.current.imposterIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.imposterIndex).toBeLessThan(3);
      expect(result.current.secretWord).toBeTruthy();
      expect(result.current.round).toBe(1);
      expect(result.current.roles).toHaveLength(3);
    });

    it('should assign roles correctly', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie']);
        result.current.setTopicKey('Food');
        result.current.startMatch();
      });

      const { roles, imposterIndex } = result.current;
      
      expect(roles[imposterIndex]).toBe('imposter');
      expect(roles.filter(r => r === 'civilian').length).toBe(2);
      expect(roles.filter(r => r === 'imposter').length).toBe(1);
    });

    it('should not assign special roles with less than 4 players', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie']);
        result.current.setTopicKey('Food');
        result.current.setEnableJester(true);
        result.current.setEnableSheriff(true);
        result.current.startMatch();
      });

      const { roles } = result.current;
      
      expect(roles.includes('jester')).toBe(false);
      expect(roles.includes('sheriff')).toBe(false);
    });

    it('should assign special roles with 4+ players when enabled', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave']);
        result.current.setTopicKey('Food');
        result.current.setEnableJester(true);
        result.current.setEnableSheriff(true);
        result.current.startMatch();
      });

      const { roles } = result.current;
      
      expect(roles.includes('imposter')).toBe(true);
      expect(roles.includes('jester')).toBe(true);
      expect(roles.includes('sheriff')).toBe(true);
      expect(roles.filter(r => r === 'civilian').length).toBe(1);
    });

    it('should assign only jester when only jester enabled', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave']);
        result.current.setTopicKey('Food');
        result.current.setEnableJester(true);
        result.current.setEnableSheriff(false);
        result.current.startMatch();
      });

      const { roles } = result.current;
      
      expect(roles.includes('jester')).toBe(true);
      expect(roles.includes('sheriff')).toBe(false);
    });
  });

  describe('Game Progression', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']);
        result.current.setTopicKey('Food');
        result.current.startMatch();
      });
    });

    it('should eliminate player and continue game', () => {
      const { result } = renderHook(() => useGameStore());
      const nonImposterIndex = result.current.roles.findIndex(r => r === 'civilian');
      
      let outcome;
      act(() => {
        outcome = result.current.eliminatePlayer(nonImposterIndex);
      });

      expect(result.current.alive[nonImposterIndex]).toBe(false);
      expect(outcome).toBe('continue');
    });

    it('should detect civilian win when imposter eliminated', () => {
      const { result } = renderHook(() => useGameStore());
      
      let outcome;
      act(() => {
        outcome = result.current.eliminatePlayer(result.current.imposterIndex);
      });

      expect(outcome).toBe('civilians');
      expect(result.current.alive[result.current.imposterIndex]).toBe(false);
    });

    it('should detect jester win when jester eliminated', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.resetMatch();
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave']);
        result.current.setTopicKey('Food');
        result.current.setEnableJester(true);
        result.current.startMatch();
      });

      const jesterIndex = result.current.roles.indexOf('jester');
      
      let outcome;
      act(() => {
        outcome = result.current.eliminatePlayer(jesterIndex);
      });

      expect(outcome).toBe('jester');
    });

    it('should detect imposter win when 2 players remain', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.resetMatch();
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']);
        result.current.setTopicKey('Food');
        result.current.setEnableJester(false);
        result.current.setEnableSheriff(false);
        result.current.startMatch();
      });
      
      const playersToEliminate = result.current.players
        .map((_, idx) => idx)
        .filter(idx => idx !== result.current.imposterIndex)
        .slice(0, 3);

      let lastOutcome;
      act(() => {
        playersToEliminate.forEach(idx => {
          lastOutcome = result.current.eliminatePlayer(idx);
        });
      });

      expect(lastOutcome).toBe('imposter');
      expect(result.current.aliveCount()).toBe(2);
    });

    it('should advance round', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.nextRound();
      });

      expect(result.current.round).toBe(2);
    });

    it('should count alive players correctly', () => {
      const { result } = renderHook(() => useGameStore());
      
      const initialAlive = result.current.aliveCount();
      expect(initialAlive).toBe(5);

      act(() => {
        result.current.eliminatePlayer(0);
      });

      expect(result.current.aliveCount()).toBe(4);
    });

    it('should reset match', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.resetMatch();
      });

      expect(result.current.secretWord).toBe('');
      expect(result.current.imposterIndex).toBeNull();
      expect(result.current.alive).toEqual([]);
      expect(result.current.round).toBe(1);
      expect(result.current.roles).toEqual([]);
    });
  });

  describe('Sheriff Ability', () => {
    it('should mark sheriff ability as used', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setSheriffUsedAbility(true);
      });

      expect(result.current.sheriffUsedAbility).toBe(true);
    });

    it('should start with sheriff ability unused', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setPlayers(['Alice', 'Bob', 'Charlie', 'Dave']);
        result.current.setTopicKey('Food');
        result.current.setEnableSheriff(true);
        result.current.startMatch();
      });

      expect(result.current.sheriffUsedAbility).toBe(false);
    });
  });

  describe('Custom Topics', () => {
    it('should add custom topic', async () => {
      const { result } = renderHook(() => useGameStore());
      
      let response;
      await act(async () => {
        response = await result.current.addCustomTopic({
          name: 'Test Topic',
          words: ['word1', 'word2', 'word3']
        });
      });

      expect(response.ok).toBe(true);
      expect(result.current.customTopics.some(t => t.name === 'Test Topic')).toBe(true);
    });

    it('should not add duplicate topic name', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.addCustomTopic({
          name: 'Test Topic',
          words: ['word1']
        });
      });

      let response;
      await act(async () => {
        response = await result.current.addCustomTopic({
          name: 'Test Topic',
          words: ['word2']
        });
      });

      expect(response.ok).toBe(false);
      expect(response.error).toContain('already exists');
    });

    it('should remove custom topic', async () => {
      const { result } = renderHook(() => useGameStore());
      
      await act(async () => {
        await result.current.addCustomTopic({
          name: 'Test Topic',
          words: ['word1']
        });
        await result.current.removeCustomTopic('Test Topic');
      });

      expect(result.current.customTopics.some(t => t.name === 'Test Topic')).toBe(false);
    });
  });
});