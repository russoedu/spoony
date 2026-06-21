import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { translation: en },
  pt: { translation: pt },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true, // 'pt-BR' -> 'pt'
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      // Persist the choice; honour an explicit app setting first.
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'spoony.lang',
      caches: ['localStorage'],
    },
  });

/** Resolve an activity label: user override wins, else the i18n default. */
export function activityLabel(
  t: (key: string, opts?: Record<string, unknown>) => string,
  activityId: string,
  override?: string
): string {
  if (override && override.trim()) return override;
  const key = `activity.${activityId}`;
  const translated = t(key);
  return translated === key ? activityId : translated;
}

export default i18n;
