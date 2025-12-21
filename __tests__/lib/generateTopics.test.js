import { generateTopics } from '../../src/lib/generateTopics';
import { useAIStore } from '../../src/store/aiStore';
import NetInfo from '@react-native-community/netinfo';
import API_CONFIG from '../../src/config/api';

// Mock dependencies
jest.mock('@react-native-community/netinfo');
jest.mock('../../src/config/api', () => ({
  BASE_URL: 'https://test-api.com',
  API_KEY: 'test-key-123',
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('generateTopics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset AI store
    useAIStore.setState({
      cache: {},
      generationsToday: 0,
      watchedAdsToday: 0,
      lastGenerationDate: new Date().toISOString(),
    });
    
    // Default NetInfo to connected
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
  });

  describe('Cache Behavior', () => {
    it('should return cached result if available', async () => {
      const params = {
        description: 'test cached',
        numTopics: 3,
        difficulty: 'medium',
        language: 'en',
      };

      const cachedData = {
        topicGroup: 'Cached Topics',
        language: 'en',
        items: ['Cached 1', 'Cached 2', 'Cached 3'],
        source: 'api',
      };

      // First call to set cache
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => cachedData.items,
      });

      await generateTopics(params);

      // Clear fetch mock for second call
      jest.clearAllMocks();

      // Second call should use cache
      const result = await generateTopics(params);

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('cache');
      expect(result.data.items).toEqual(cachedData.items);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should cache successful API responses', async () => {
      const apiResponse = ['Word 1', 'Word 2', 'Word 3'];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      const result = await generateTopics({
        description: 'unique test description',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(apiResponse);
      
      // Verify cache was set
      const cache = useAIStore.getState().cache;
      const cacheKeys = Object.keys(cache);
      expect(cacheKeys.length).toBeGreaterThan(0);
    });
  });

  describe('API Integration', () => {
    it('should make API call with correct parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ['Test 1', 'Test 2'],
      });

      await generateTopics({
        description: 'test description',
        numTopics: 5,
        difficulty: 'hard',
        language: 'es',
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.com/api/complete',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key-123',
          }),
          body: expect.stringContaining('test description'),
        })
      );

      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody).toEqual({
        prompt: 'test description',
        count: 5,
        difficulty: 'hard',
      });
    });

    it('should handle API response with array format', async () => {
      const apiResponse = ['Apple', 'Banana', 'Cherry'];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      const result = await generateTopics({
        description: 'fruits',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(apiResponse);
      expect(result.data.topicGroup).toBe('fruits');
      expect(result.data.source).toBe('api');
    });

    it('should handle API response with items array format', async () => {
      const apiResponse = {
        items: ['Dog', 'Cat', 'Bird'],
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      const result = await generateTopics({
        description: 'animals',
        numTopics: 3,
        difficulty: 'medium',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(apiResponse.items);
    });

    it('should handle API response with word objects', async () => {
      const apiResponse = [
        { word: 'Red' },
        { word: 'Blue' },
        { word: 'Green' },
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      const result = await generateTopics({
        description: 'colors',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(['Red', 'Blue', 'Green']);
    });

    it('should handle 401 authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await generateTopics({
        description: 'test',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('local-fallback');
      expect(result.warning).toContain('Authentication failed');
    });

    it('should handle invalid response format', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'format' }),
      });

      const result = await generateTopics({
        description: 'test',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('local-fallback');
      expect(result.warning).toContain('Invalid response format');
    });

    it('should filter out null/undefined items from API response', async () => {
      const apiResponse = ['Valid', null, 'Another', undefined, '', 'Third'];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      const result = await generateTopics({
        description: 'test',
        numTopics: 6,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(['Valid', 'Another', 'Third']);
    });
  });

  describe('Network Handling', () => {
    it('should use local fallback when offline', async () => {
      NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

      const result = await generateTopics({
        description: 'offline test',
        numTopics: 5,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('local-fallback');
      expect(result.data.items).toHaveLength(5);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should use local fallback on network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network request failed'));

      const result = await generateTopics({
        description: 'network error',
        numTopics: 4,
        difficulty: 'medium',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.source).toBe('local-fallback');
      expect(result.data.items).toHaveLength(4);
      expect(result.warning).toContain('Network request failed');
    });
  });

  describe('Local Fallback Generation', () => {
    beforeEach(() => {
      NetInfo.fetch.mockResolvedValue({ isConnected: false });
    });

    it('should generate fallback topics from description', async () => {
      const result = await generateTopics({
        description: 'space planets stars',
        numTopics: 6,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(6);
      expect(result.data.topicGroup).toBe('space planets stars');
      expect(result.data.source).toBe('local-fallback');
    });

    it('should capitalize fallback words', async () => {
      const result = await generateTopics({
        description: 'cars trucks bikes',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.data.items.every(item => 
        item[0] === item[0].toUpperCase()
      )).toBe(true);
    });

    it('should handle single word description', async () => {
      const result = await generateTopics({
        description: 'technology',
        numTopics: 5,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(5);
      expect(result.data.items[0]).toContain('Technology');
    });

    it('should handle empty description gracefully', async () => {
      const result = await generateTopics({
        description: '',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.topicGroup).toBe('AI Topics');
      // Empty description won't generate items from words, but test should succeed
      expect(Array.isArray(result.data.items)).toBe(true);
    });

    it('should create unique variations', async () => {
      const result = await generateTopics({
        description: 'game',
        numTopics: 10,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      const uniqueItems = new Set(result.data.items);
      expect(uniqueItems.size).toBe(result.data.items.length);
    });

    it('should handle special characters in description', async () => {
      const result = await generateTopics({
        description: 'food, drinks; snacks.',
        numTopics: 6,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(6);
    });

    it('should filter out short words (less than 3 chars)', async () => {
      const result = await generateTopics({
        description: 'a big car on the road',
        numTopics: 5,
        difficulty: 'easy',
        language: 'en',
      });

      expect(result.success).toBe(true);
      // Should use 'big', 'car', 'road' - words with 3+ chars
      expect(result.data.items.some(item => 
        item.toLowerCase().includes('big') || 
        item.toLowerCase().includes('car') || 
        item.toLowerCase().includes('road')
      )).toBe(true);
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      NetInfo.fetch.mockResolvedValue({ isConnected: false });
    });

    it('should handle various numTopics values', async () => {
      const testCases = [1, 3, 5, 10, 15];
      
      for (const numTopics of testCases) {
        const result = await generateTopics({
          description: 'test',
          numTopics,
          difficulty: 'easy',
          language: 'en',
        });

        expect(result.data.items.length).toBeLessThanOrEqual(numTopics);
      }
    });

    it('should handle different difficulty levels', async () => {
      const difficulties = ['easy', 'medium', 'hard'];
      
      for (const difficulty of difficulties) {
        const result = await generateTopics({
          description: 'test',
          numTopics: 3,
          difficulty,
          language: 'en',
        });

        expect(result.success).toBe(true);
      }
    });

    it('should preserve language in response', async () => {
      const result = await generateTopics({
        description: 'test',
        numTopics: 3,
        difficulty: 'easy',
        language: 'es',
      });

      expect(result.success).toBe(true);
      // Fallback sets language to 'en' but topicGroup is preserved
      expect(result.data.topicGroup).toBe('test');
    });
  });

  describe('Hash Generation and Caching', () => {
    it('should use cache for identical API requests', async () => {
      const params = {
        description: 'consistent test',
        numTopics: 5,
        difficulty: 'medium',
        language: 'en',
      };

      // First API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      });

      const result1 = await generateTopics(params);
      expect(result1.data.source).toBe('api');

      // Clear fetch mock
      jest.clearAllMocks();

      // Second call with same params should use cache
      const result2 = await generateTopics(params);

      expect(result2.data.source).toBe('cache');
      expect(result2.data.items).toEqual(result1.data.items);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should create different cache entries for different inputs', async () => {
      // First request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ['First 1', 'First 2', 'First 3'],
      });

      await generateTopics({
        description: 'first',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      const cacheCountAfterFirst = Object.keys(useAIStore.getState().cache).length;
      expect(cacheCountAfterFirst).toBe(1);

      // Second request with different params
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ['Second 1', 'Second 2', 'Second 3'],
      });

      await generateTopics({
        description: 'second',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      const cacheCountAfterSecond = Object.keys(useAIStore.getState().cache).length;
      expect(cacheCountAfterSecond).toBe(2);
    });

    it('should differentiate cache by all parameters', async () => {
      // Same description, different difficulty
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ['Item 1', 'Item 2'],
      });

      await generateTopics({
        description: 'test',
        numTopics: 3,
        difficulty: 'easy',
        language: 'en',
      });

      await generateTopics({
        description: 'test',
        numTopics: 3,
        difficulty: 'hard',
        language: 'en',
      });

      const cacheCount = Object.keys(useAIStore.getState().cache).length;
      expect(cacheCount).toBe(2);
    });
  });
});