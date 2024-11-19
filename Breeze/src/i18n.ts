import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ja from './locales/ja.json';

// Tipo per la struttura dei messaggi
type MessageSchema = {
  welcome: string;
  language: string;
  switchToJapanese: string;
  switchToEnglish: string;
  login: {
    title: string;
    email: string;
    password: string;
    submit: string;
    register: string;
  };
  register: {
    title: string;
    adminName: string;
    organizationName: string;
    organizationDetails: string;
    submit: string;
    success: string;
    errorFillAllFields: string;
  };
};

// Tipo per le chiavi delle lingue
type AvailableLocales = 'en-US' | 'ja-JP';

const i18n = createI18n<{
  locale: AvailableLocales;
  fallbackLocale: AvailableLocales;
  messages: Record<AvailableLocales, MessageSchema>;
}>({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en,
    'ja-JP': ja,
  },
});

export default i18n;


