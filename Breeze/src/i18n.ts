import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ja from './locales/ja.json';


type AvailableLocales = 'en-US' | 'ja-JP';
type MessageSchema = typeof en;


const i18n = createI18n({
  legacy: false, 
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en,
    'ja-JP': ja,
  } as Record<AvailableLocales, MessageSchema>, 
});

export default i18n;