import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/settingsStore';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async loadSound(key, source) {
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      this.sounds[key] = sound;
      return sound;
    } catch (error) {
      console.warn(`Failed to load sound ${key}:`, error);
      return null;
    }
  }

  async playSound(key, volume = 1.0) {
    const settings = useSettingsStore.getState();
    if (!settings.soundEnabled) return;

    try {
      const sound = this.sounds[key];
      if (!sound) return;

      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume * (settings.soundVolume || 1.0));
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${key}:`, error);
    }
  }

  async unloadAll() {
    try {
      await Promise.all(
        Object.values(this.sounds).map(sound => sound?.unloadAsync())
      );
      this.sounds = {};
    } catch (error) {
      console.warn('Failed to unload sounds:', error);
    }
  }
}

export const soundManager = new SoundManager();

// Convenience methods
export const initSounds = () => soundManager.initialize();
export const playSound = (key, volume) => soundManager.playSound(key, volume);
export const loadSound = (key, source) => soundManager.loadSound(key, source);
export const unloadSounds = () => soundManager.unloadAll();