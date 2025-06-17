// server/src/modules/genre/index.ts

export * from './genre.model'; // Export IGenre interface
export { default as GenreModel } from './genre.model'; // Export GenreModel
export * from './genre.schema'; // << THÊM DÒNG NÀY

// Các file khác của module 'genre' sẽ được export ở đây sau này
export * as genreService from './genre.service';
export * as genreController from './genre.controller';
export { default as genreRoutes } from './genre.route'; 
 