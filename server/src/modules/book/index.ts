// server/src/modules/book/index.ts

export * from './book.model'; // Export tất cả các named exports từ book.model.ts (ví dụ các interface IBook, IPageNode,...)
export { default as BookModel } from './book.model'; // Export cái BookModel (default export)

// Các dòng dưới này vẫn comment, khi nào mình tạo file thì bỏ comment sau:
// export * from './book.service';
// export * from './book.controller';
// export * from './book.route';
// export * from './book.schema';