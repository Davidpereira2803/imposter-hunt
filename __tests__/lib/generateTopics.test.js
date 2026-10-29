import { generateTopics } from '../../src/lib/generateTopics';
import { useAIStore } from '../../src/store/aiStore';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo');
jest.mock('../../src/config/api', () => ({ BASE_URL: 'https://test-api.com', API_KEY: 'test-key' }));

const params = { description: 'space', numTopics: 3, difficulty: 'easy', language: 'fr' };
const response = (data) => ({ ok: true, json: jest.fn().mockResolvedValue(data) });

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  useAIStore.setState({ cache: {} });
  NetInfo.fetch.mockResolvedValue({ isConnected: true });
});
afterEach(() => jest.useRealTimers());

test('sends the selected language, description, count and difficulty to the backend', async () => {
  fetch.mockResolvedValue(response(['Lune', 'Mars', 'Terre']));
  const result = await generateTopics(params);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ prompt: 'space', count: 3, difficulty: 'easy', language: 'fr' });
  expect(result.data).toMatchObject({ language: 'fr', source: 'api', items: ['Lune', 'Mars', 'Terre'] });
});

test.each([
  ['array', ['Moon', 'Mars']],
  ['items object', { items: ['Moon', 'Mars'] }],
  ['word objects', [{ word: 'Moon' }, { word: 'Mars' }]],
])('accepts %s responses', async (_, data) => {
  fetch.mockResolvedValue(response(data));
  expect((await generateTopics(params)).data.items).toEqual(['Moon', 'Mars']);
});

test('normalizes, deduplicates and caps usable words', async () => {
  fetch.mockResolvedValue(response([' Moon ', null, { word: 5 }, 'Moon', '', '  ', 'Mars', 'Earth', 'Venus']));
  expect((await generateTopics(params)).data.items).toEqual(['Moon', 'Mars', 'Earth']);
});

test.each([[], { items: [] }, { invalid: true }, [null, { word: 5 }, '  ']])('rejects unusable response %j without caching it', async (data) => {
  fetch.mockResolvedValue(response(data));
  expect(await generateTopics(params)).toMatchObject({ success: false, code: 'invalid-response' });
  expect(useAIStore.getState().cache).toEqual({});
});

test.each([401, 403, 429, 500])('returns a failure for HTTP %i without revealing the server body', async (status) => {
  fetch.mockResolvedValue({ ok: false, status, text: async () => 'private server detail' });
  const result = await generateTopics(params);
  expect(result.success).toBe(false);
  expect(result.data).toBeUndefined();
  expect(result.error).not.toContain('private server detail');
  expect(useAIStore.getState().cache).toEqual({});
});

test.each([{ isConnected: false }, { isConnected: true, isInternetReachable: false }])('fails honestly when offline: %j', async (state) => {
  NetInfo.fetch.mockResolvedValue(state);
  expect(await generateTopics(params)).toMatchObject({ success: false, code: 'offline' });
  expect(fetch).not.toHaveBeenCalled();
});

test('allows a request when network reachability is not known yet', async () => {
  NetInfo.fetch.mockResolvedValue({ isConnected: null });
  fetch.mockResolvedValue(response(['Moon']));
  expect((await generateTopics(params)).success).toBe(true);
});

test('returns an error on network failure and clears the timeout', async () => {
  jest.useFakeTimers();
  fetch.mockRejectedValue(new Error('Network request failed'));
  expect(await generateTopics(params)).toMatchObject({ success: false, code: 'network' });
  expect(jest.getTimerCount()).toBe(0);
});

test('keeps the timeout active through response parsing, aborts and clears it', async () => {
  jest.useFakeTimers();
  let rejectBody;
  fetch.mockImplementation(async (_, { signal }) => ({
    ok: true,
    json: () => new Promise((_, reject) => {
      rejectBody = reject;
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }),
  }));
  const result = generateTopics(params);
  // Drain the network-info and fetch promise continuations.
  await Promise.resolve();
  await Promise.resolve();
  expect(rejectBody).toBeDefined();
  await jest.advanceTimersByTimeAsync(30000);
  expect(await result).toMatchObject({ success: false, code: 'timeout' });
  expect(jest.getTimerCount()).toBe(0);
});

test('serves previously generated words offline without a network request', async () => {
  fetch.mockResolvedValue(response(['Moon', 'Mars']));
  await generateTopics(params);
  fetch.mockClear();
  NetInfo.fetch.mockResolvedValue({ isConnected: false });
  expect((await generateTopics(params)).data).toMatchObject({ source: 'cache', items: ['Moon', 'Mars'] });
  expect(fetch).not.toHaveBeenCalled();
});

test('separates languages in the cache', async () => {
  fetch.mockResolvedValue(response(['Moon']));
  await generateTopics(params);
  await generateTopics({ ...params, language: 'en' });
  expect(fetch).toHaveBeenCalledTimes(2);
});

test.each(['', null, undefined])('rejects missing description %j', async (description) => {
  expect(await generateTopics({ ...params, description })).toMatchObject({ success: false, code: 'invalid-input' });
  expect(fetch).not.toHaveBeenCalled();
});

test.each([0, -1, 101, 1.5, '3'])('rejects invalid topic count %j', async (numTopics) => {
  expect(await generateTopics({ ...params, numTopics })).toMatchObject({ success: false, code: 'invalid-input' });
  expect(fetch).not.toHaveBeenCalled();
});
