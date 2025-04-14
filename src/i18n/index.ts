
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Dynamic import of all language translations
// This will automatically include any JSON file in the locales directory
const importLocales = () => {
  const locales: Record<string, any> = {};
  const localeContext = import.meta.glob('./locales/*.json', { eager: true });
  
  Object.entries(localeContext).forEach(([path, module]) => {
    // Extract language code from path (e.g., './locales/en.json' -> 'en')
    const langCode = path.match(/\.\/locales\/(.+)\.json/)?.[1];
    if (langCode) {
      // Use module as is since module.default might not exist in all cases
      locales[langCode] = { 
        translation: module as Record<string, any>
      };
    }
  });
  
  return locales;
};

// Get all available languages for language selector
export const getAvailableLanguages = (): string[] => {
  const localeContext = import.meta.glob('./locales/*.json', { eager: true });
  return Object.keys(localeContext).map(path => {
    const match = path.match(/\.\/locales\/(.+)\.json/);
    return match ? match[1] : '';
  }).filter(Boolean);
};

const resources = importLocales();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // Default language is English
    lng: "en",         // Force English as the initial language
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
