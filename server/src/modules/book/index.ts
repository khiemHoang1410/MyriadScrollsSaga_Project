// src/modules/book/index.ts
export * from './book.model';
export { default as BookModel } from './book.model';
export * from './book.schema'; // Đảm bảo export các schema và type
export * as bookService from './book.service';
export * as bookController from './book.controller';
export { default as bookRoutes } from './book.route'; // Export route