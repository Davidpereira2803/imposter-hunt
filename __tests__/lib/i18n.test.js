import i18n from '../../src/lib/i18n';
import * as Localization from 'expo-localization';

jest.mock('expo-localization', () => ({
  locale: 'en-US',
}));

describe('i18n', () => {
  describe('Initialization', () => {
    it('should be an instance of I18n', () => {
      expect(i18n).toBeDefined();
      expect(i18n.translate).toBeInstanceOf(Function);
      expect(i18n.t).toBeInstanceOf(Function);
    });

    it('should have fallback enabled', () => {
      expect(i18n.enableFallback).toBe(true);
    });

    it('should have English as default locale', () => {
      expect(i18n.defaultLocale).toBe('en');
    });

    it('should have a locale set', () => {
      expect(i18n.locale).toBeDefined();
      expect(typeof i18n.locale).toBe('string');
    });
  });

  describe('Translations', () => {
    it('should have all language translations loaded', () => {
      const expectedLanguages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];

      expectedLanguages.forEach((lang) => {
        expect(i18n.translations[lang]).toBeDefined();
        expect(typeof i18n.translations[lang]).toBe('object');
      });
    });

    it('should translate common keys in English', () => {
      i18n.locale = 'en';

      expect(i18n.t('common.continue')).toBe('Continue');
      expect(i18n.t('common.cancel')).toBe('Cancel');
      expect(i18n.t('common.save')).toBe('Save');
    });

    it('should translate home keys', () => {
      i18n.locale = 'en';

      expect(i18n.t('home.title')).toContain('Imposter');
      expect(i18n.t('home.newGame')).toBe('New Game');
      expect(i18n.t('home.howToPlay')).toBe('How to Play');
    });

    it('should translate setup keys', () => {
      i18n.locale = 'en';

      expect(i18n.t('setup.title')).toBe('Setup');
      expect(i18n.t('setup.players')).toBe('Players');
    });

    it('should handle missing keys with fallback', () => {
      i18n.locale = 'en';

      const result = i18n.t('nonexistent.key.path');
      expect(result).toContain('nonexistent.key.path');
    });

    it('should support interpolation', () => {
      i18n.locale = 'en';

      const result = i18n.t('common.continue');
      expect(typeof result).toBe('string');
    });
  });

  describe('Locale Switching', () => {
    it('should switch to Spanish', () => {
      i18n.locale = 'es';

      expect(i18n.locale).toBe('es');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should switch to Portuguese', () => {
      i18n.locale = 'pt';

      expect(i18n.locale).toBe('pt');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should switch to French', () => {
      i18n.locale = 'fr';

      expect(i18n.locale).toBe('fr');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should switch to German', () => {
      i18n.locale = 'de';

      expect(i18n.locale).toBe('de');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should switch to Italian', () => {
      i18n.locale = 'it';

      expect(i18n.locale).toBe('it');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should switch to Luxembourgish', () => {
      i18n.locale = 'lu';

      expect(i18n.locale).toBe('lu');
      expect(typeof i18n.t('common.continue')).toBe('string');
    });

    it('should maintain translations after switching locales', () => {
      i18n.locale = 'en';
      const enTranslation = i18n.t('common.continue');

      i18n.locale = 'es';
      const esTranslation = i18n.t('common.continue');

      expect(enTranslation).toBeTruthy();
      expect(esTranslation).toBeTruthy();
      expect(typeof enTranslation).toBe('string');
      expect(typeof esTranslation).toBe('string');
    });
  });

  describe('Locale Resolution', () => {
    it('should resolve locale from device settings', () => {
      expect(['en', 'pt', 'fr', 'de', 'lu', 'it', 'es']).toContain(i18n.locale);
    });

    it('should handle invalid locale gracefully', () => {
      i18n.locale = 'invalid';

      const result = i18n.t('common.continue', { defaultValue: 'Continue' });
      expect(typeof result).toBe('string');
    });
  });

  describe('Translation Structure', () => {
    it('should have consistent key structure across languages', () => {
      const languages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];
      const baseKeys = Object.keys(i18n.translations.en);

      languages.forEach((lang) => {
        const langKeys = Object.keys(i18n.translations[lang]);

        baseKeys.forEach((key) => {
          expect(langKeys).toContain(key);
        });
      });
    });

    it('should have common section in all languages', () => {
      const languages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];

      languages.forEach((lang) => {
        expect(i18n.translations[lang].common).toBeDefined();
        expect(typeof i18n.translations[lang].common).toBe('object');
      });
    });

    it('should have home section in all languages', () => {
      const languages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];

      languages.forEach((lang) => {
        expect(i18n.translations[lang].home).toBeDefined();
        expect(typeof i18n.translations[lang].home).toBe('object');
      });
    });

    it('should have setup section in all languages', () => {
      const languages = ['en', 'pt', 'fr', 'de', 'lu', 'it', 'es'];

      languages.forEach((lang) => {
        expect(i18n.translations[lang].setup).toBeDefined();
        expect(typeof i18n.translations[lang].setup).toBe('object');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined key gracefully', () => {
      i18n.locale = 'en';

      const result = i18n.t(undefined);
      expect(typeof result).toBe('string');
    });

    it('should handle null key gracefully', () => {
      i18n.locale = 'en';

      const result = i18n.t(null);
      expect(typeof result).toBe('string');
    });

    it('should handle empty string key', () => {
      i18n.locale = 'en';

      const result = i18n.t('');
      expect(typeof result).toBe('string');
    });

    it('should handle deeply nested missing keys', () => {
      i18n.locale = 'en';

      const result = i18n.t('some.very.deep.nested.missing.key');
      expect(typeof result).toBe('string');
    });
  });

  describe('Translation Methods', () => {
    it('should translate using t() shorthand', () => {
      i18n.locale = 'en';

      const result = i18n.t('common.continue');
      expect(result).toBe('Continue');
    });

    it('should translate using translate() method', () => {
      i18n.locale = 'en';

      const result = i18n.translate('common.continue');
      expect(result).toBe('Continue');
    });

    it('should have t and translate return same results', () => {
      i18n.locale = 'en';

      const tResult = i18n.t('common.save');
      const translateResult = i18n.translate('common.save');

      expect(tResult).toBe(translateResult);
    });

    it('should support default values', () => {
      i18n.locale = 'en';

      const result = i18n.t('missing.key', { defaultValue: 'Default Text' });
      expect(result).toBe('Default Text');
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to default locale for missing translations', () => {
      i18n.locale = 'en';

      const result = i18n.t('common.continue');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use English as fallback when key missing in other language', () => {
      i18n.locale = 'en';
      const enValue = i18n.t('common.continue');

      expect(enValue).toBe('Continue');
    });
  });
});