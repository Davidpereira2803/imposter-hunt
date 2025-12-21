import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageStore } from '../../src/store/languageStore';
import i18n from '../../src/lib/i18n';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Language Store', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    const { result } = renderHook(() => useLanguageStore());
    await act(async () => {
      result.current.setLocale('en');
    });
    
    i18n.locale = 'en';
  });

  describe('Initial State', () => {
    it('should have English as default locale', () => {
      const { result } = renderHook(() => useLanguageStore());
      expect(result.current.locale).toBe('en');
    });

    it('should sync i18n locale with store locale', () => {
      const { result } = renderHook(() => useLanguageStore());
      expect(i18n.locale).toBe(result.current.locale);
    });
  });

  describe('Setting Locale', () => {
    it('should change locale to a valid language', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('es');
      });

      expect(result.current.locale).toBe('es');
      expect(i18n.locale).toBe('es');
    });

    it('should support all available languages', () => {
      const { result } = renderHook(() => useLanguageStore());
      const supportedLanguages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];

      supportedLanguages.forEach(lang => {
        act(() => {
          result.current.setLocale(lang);
        });

        expect(result.current.locale).toBe(lang);
        expect(i18n.locale).toBe(lang);
      });
    });

    it('should not change locale for invalid language codes', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('en');
      });

      const previousLocale = result.current.locale;

      act(() => {
        result.current.setLocale('invalid');
      });

      expect(result.current.locale).toBe(previousLocale);
      expect(result.current.locale).toBe('en');
    });

    it('should not change i18n locale for invalid language', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('fr');
      });

      expect(i18n.locale).toBe('fr');

      act(() => {
        result.current.setLocale('nonexistent');
      });

      expect(i18n.locale).toBe('fr');
    });

    it('should handle null or undefined locale gracefully', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('de');
      });

      const previousLocale = result.current.locale;

      act(() => {
        result.current.setLocale(null);
      });

      expect(result.current.locale).toBe(previousLocale);

      act(() => {
        result.current.setLocale(undefined);
      });

      expect(result.current.locale).toBe(previousLocale);
    });
  });

  describe('Persistence', () => {
    it('should persist locale changes to AsyncStorage', async () => {
      jest.clearAllMocks();
      
      const { result } = renderHook(() => useLanguageStore());
      
      await act(async () => {
        result.current.setLocale('pt');
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const calls = AsyncStorage.setItem.mock.calls;
      const languageCalls = calls.filter(call => 
        call[0] === 'imposter-hunt-language'
      );
      
      expect(languageCalls.length).toBeGreaterThan(0);
      
      const lastCall = languageCalls[languageCalls.length - 1];
      const storedData = JSON.parse(lastCall[1]);
      expect(storedData.state.locale).toBe('pt');
    });

    it('should call AsyncStorage.setItem with correct storage key', async () => {
      jest.clearAllMocks();
      
      const { result } = renderHook(() => useLanguageStore());
      
      await act(async () => {
        result.current.setLocale('de');
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = AsyncStorage.setItem.mock.calls;
      const hasCorrectKey = calls.some(call => call[0] === 'imposter-hunt-language');
      
      expect(hasCorrectKey).toBe(true);
    });
  });

  describe('i18n Integration', () => {
    it('should keep store and i18n locales in sync', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      const testLocales = ['en', 'es', 'fr', 'de'];
      
      testLocales.forEach(locale => {
        act(() => {
          result.current.setLocale(locale);
        });

        expect(result.current.locale).toBe(i18n.locale);
      });
    });

    it('should allow i18n translations after locale change', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('es');
      });

      expect(i18n.locale).toBe('es');
      expect(i18n.translations.es).toBeDefined();
    });

    it('should have translations available for all supported locales', () => {
      const supportedLanguages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];
      
      supportedLanguages.forEach(locale => {
        expect(i18n.translations[locale]).toBeDefined();
      });
    });

    it('should update i18n immediately when locale changes', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('pt');
      });

      expect(i18n.locale).toBe('pt');
      
      act(() => {
        result.current.setLocale('it');
      });

      expect(i18n.locale).toBe('it');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid locale changes', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('es');
        result.current.setLocale('fr');
        result.current.setLocale('de');
        result.current.setLocale('pt');
      });

      expect(result.current.locale).toBe('pt');
      expect(i18n.locale).toBe('pt');
    });

    it('should handle setting same locale multiple times', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('fr');
        result.current.setLocale('fr');
        result.current.setLocale('fr');
      });

      expect(result.current.locale).toBe('fr');
      expect(i18n.locale).toBe('fr');
    });

    it('should handle empty string locale', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      act(() => {
        result.current.setLocale('es');
      });

      const previousLocale = result.current.locale;

      act(() => {
        result.current.setLocale('');
      });

      expect(result.current.locale).toBe(previousLocale);
    });
  });

  describe('Store API', () => {
    it('should expose setLocale method', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      expect(typeof result.current.setLocale).toBe('function');
    });

    it('should expose locale property', () => {
      const { result } = renderHook(() => useLanguageStore());
      
      expect(typeof result.current.locale).toBe('string');
    });

    it('should only have expected properties', () => {
      const { result } = renderHook(() => useLanguageStore());
      const keys = Object.keys(result.current);
      
      expect(keys).toContain('locale');
      expect(keys).toContain('setLocale');
    });
  });
});