import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file translation
import enTranslation from './shared/locales/en/translation.json';
import viTranslation from './shared/locales/vi/translation.json';

i18n
    // Phát hiện ngôn ngữ người dùng
    .use(LanguageDetector)
    // Kết nối i18next với react
    .use(initReactI18next)
    // Khởi tạo i18next
    .init({
        debug: true, // Bật chế độ debug, chỉ nên dùng khi phát triển
        fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không phát hiện được
        interpolation: {
            escapeValue: false, // React đã tự chống XSS rồi
        },
        resources: {
            vi: {
                translation: viTranslation,
            },
            en: {
                translation: enTranslation,
            },
        },
    });

export default i18n;