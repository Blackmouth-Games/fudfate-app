
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import language translations dynamically
const importAllLocales = () => {
  const localeContext = import.meta.glob('./locales/*.json', { eager: true });
  
  const resources: { [key: string]: { translation: any } } = {};
  
  // Process all locale files from the glob import
  Object.entries(localeContext).forEach(([path, module]) => {
    // Extract language code from path (e.g., './locales/en.json' -> 'en')
    const langCode = path.match(/\.\/locales\/(.+)\.json/)?.[1];
    
    if (langCode) {
      resources[langCode] = { 
        translation: module.default || module 
      };
      console.log(`Loaded language: ${langCode}`);
    }
  });
  
  return resources;
};

// Get all available languages
const resources = importAllLocales();

// Get language codes for the dropdown
export const availableLanguages = Object.keys(resources);

console.log('Available languages:', availableLanguages);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
