
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all language translations
import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";

// Function to get all available languages from the locales folder
const getAvailableLanguages = () => {
  const resources: { [key: string]: { translation: any } } = {};
  
  // Add languages that exist in the locales folder
  try {
    resources['en'] = { translation: enTranslation };
    resources['es'] = { translation: esTranslation };
    // More languages will be added automatically when their JSON files are added to the locales folder
  } catch (error) {
    console.error("Error loading language resources:", error);
  }

  return resources;
};

const resources = getAvailableLanguages();

// Get language codes for the dropdown
export const availableLanguages = Object.keys(resources);

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
