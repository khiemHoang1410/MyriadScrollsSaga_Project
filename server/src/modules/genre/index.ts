// server/src/modules/genre/index.ts

export * from './genre.model'; // Export IGenre interface
export { default as GenreModel } from './genre.model'; // Export GenreModel

// Các file khác của module 'genre' sẽ được export ở đây sau này
// export * from './genre.service';
// export * from './genre.controller';
// export * from './genre.route';
// export * from './genre.schema';