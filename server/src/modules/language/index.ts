// server/src/modules/language/index.ts
export * from './language.model'; // Export ILanguage interface
export { default as LanguageModel } from './language.model'; // Export LanguageModel
export * from './language.schema';
export * as languageService from './language.service'; // Export tất cả các hàm service
export * as languageController from './language.controller'; // Export tất cả các controller handlers
export { default as languageRoutes } from './language.route'; // Export router