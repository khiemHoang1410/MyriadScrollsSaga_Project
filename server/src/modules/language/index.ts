// server/src/modules/language/index.ts

export * from './language.model'; // Export ILanguage interface
export { default as LanguageModel } from './language.model'; // Export LanguageModel

// Các file khác của module 'language' sẽ được export ở đây sau này
// export * from './language.service';
// export * from './language.controller';
// export * from './language.route';
// export * from './language.schema';