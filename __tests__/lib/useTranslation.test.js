import { renderHook, act } from '@testing-library/react-native';
import { useTranslation } from '../../src/lib/useTranslation';
import { useLanguageStore } from '../../src/store/languageStore';
import i18n from '../../src/lib/i18n';

describe('useTranslation hook', () => {
  beforeEach(async () => {
    const { result } = renderHook(() => useLanguageStore());
    await act(async () => {
      result.current.setLocale('en');
    });
    i18n.locale = 'en';
  });

  it('returns t() and current locale', () => {
    const { result } = renderHook(() => useTranslation());
    expect(typeof result.current.t).toBe('function');
    expect(result.current.locale).toBe('en');
  });

  it('translates existing keys', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.continue')).toBe('Continue');
    expect(result.current.t('common.save')).toBe('Save');
  });

  it('uses string fallback when key is missing', () => {
    const { result } = renderHook(() => useTranslation());
    const out = result.current.t('missing.key.path', 'Default Text');
    expect(out).toBe('Default Text');
  });

  it('forwards options to i18n and uses defaultValue when missing', () => {
    const { result } = renderHook(() => useTranslation());
    const out = result.current.t('missing.key', { defaultValue: 'Default via options' });
    expect(out).toBe('Default via options');
  });

  it('returns the key itself when missing and no fallback/options provided', () => {
    const { result } = renderHook(() => useTranslation());
    const out = result.current.t('missing.again.key');
    expect(out).toBe('missing.again.key');
  });

  it('ignores fallback when translation exists', () => {
    const { result } = renderHook(() => useTranslation());
    const out = result.current.t('common.cancel', 'Fallback Cancel');
    expect(out).toBe('Cancel');
  });

  it('supports fallback plus options signature', () => {
    const { result } = renderHook(() => useTranslation());
    const out = result.current.t('missing.combo', 'Combo Fallback', { defaultValue: 'Options Default' });
    expect(out).toBe('Combo Fallback');
  });

  it('reacts to locale changes via store', async () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('common.save')).toBe('Save');

    const store = renderHook(() => useLanguageStore()).result;
    await act(async () => {
      store.current.setLocale('pt');
    });

    expect(i18n.locale).toBe('pt');

    expect(result.current.t('common.save')).toBe('Salvar');
    expect(result.current.locale).toBe('pt');
  });
});