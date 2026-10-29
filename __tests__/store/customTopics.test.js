import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from '../../src/store/gameStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  useGameStore.setState({ customTopics: [] });
});

test('concurrent additions are both saved to persistent storage', async () => {
  const { addCustomTopic } = useGameStore.getState();
  const results = await Promise.all([
    addCustomTopic({ name: 'First', words: ['one'] }),
    addCustomTopic({ name: 'Second', words: ['two'] }),
  ]);
  expect(results).toEqual([{ ok: true }, { ok: true }]);
  const saved = JSON.parse(await AsyncStorage.getItem('imposter-hunt-custom-topics'));
  expect(saved.map(topic => topic.name)).toEqual(['First', 'Second']);
  expect(saved).toEqual(useGameStore.getState().customTopics);
});

test('concurrent additions with the same name cannot create duplicate topics', async () => {
  const { addCustomTopic } = useGameStore.getState();
  const results = await Promise.all([
    addCustomTopic({ name: 'Same', words: ['one'] }),
    addCustomTopic({ name: 'Same', words: ['two'] }),
  ]);
  expect(results.map(result => result.ok)).toEqual([true, false]);
  expect(useGameStore.getState().customTopics).toHaveLength(1);
});

test('a failed write does not publish an unsaved topic and permits a later retry', async () => {
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Disk full'));
  const { addCustomTopic } = useGameStore.getState();
  expect(await addCustomTopic({ name: 'Retry', words: ['one'] })).toMatchObject({ ok: false, code: 'storage' });
  expect(useGameStore.getState().customTopics).toEqual([]);
  expect(await addCustomTopic({ name: 'Retry', words: ['one'] })).toEqual({ ok: true });
});
