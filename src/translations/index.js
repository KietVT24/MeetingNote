import { vi } from './vi.js';
import { en } from './en.js';
import { ko } from './ko.js';
import { zh } from './zh.js';
import { ja } from './ja.js';

export const translations = {
  vi,
  en,
  ko,
  zh,
  ja,
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let translation = translations[language];

  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      translation = translations['vi'];
      for (const fallbackKey of keys) {
        if (translation && translation[fallbackKey]) {
          translation = translation[fallbackKey];
        } else {
          return key;
        }
      }
      break;
    }
  }

  return translation;
};
