// server/src/modules/genre/genre.controller.ts
import { Request, Response, NextFunction } from 'express';
import { genreService } from './';
import {
  CreateGenreInput,
  UpdateGenreInput,
  UpdateGenreParams,
  GenreIdParams,
} from './genre.schema';
import { HttpStatus, GeneralMessages } from '@/types';

// Hàm test cũ, có thể giữ lại hoặc xóa nếu không cần nữa
export const testGenreHandler = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('Test Genre Handler Called!');
    res.status(HttpStatus.OK).json({ message: 'Genre test route is working!' });
  } catch (error) {
    next(error);
  }
};

// --- Các Async Handlers đã được tối ưu cho asyncHandler wrapper ---

export const createGenreHandler = async (
  req: Request<{}, {}, CreateGenreInput>,
  res: Response
  // next: NextFunction // Không cần next ở đây nếu asyncHandler xử lý
): Promise<void> => {
  const genreData = req.body;
  const newGenre = await genreService.createGenre(genreData);
  res.status(HttpStatus.CREATED).json({
    message: 'Genre created successfully!',
    data: newGenre,
  });
};

export const getAllGenresHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const genres = await genreService.getAllGenres();
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    count: genres.length,
    data: genres,
  });
};

export const getGenreByIdHandler = async (
  req: Request<GenreIdParams>,
  res: Response
): Promise<void> => {
  const { genreId } = req.params;
  const genre = await genreService.getGenreById(genreId);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: genre,
  });
};

export const updateGenreByIdHandler = async (
  req: Request<UpdateGenreParams, {}, UpdateGenreInput>,
  res: Response
): Promise<void> => {
  const { genreId } = req.params;
  const updateData = req.body;
  const updatedGenre = await genreService.updateGenreById(genreId, updateData);
  res.status(HttpStatus.OK).json({
    message: 'Genre updated successfully!',
    data: updatedGenre,
  });
};

export const deleteGenreByIdHandler = async (
  req: Request<GenreIdParams>,
  res: Response
): Promise<void> => {
  const { genreId } = req.params;
  await genreService.deleteGenreById(genreId);
  res.status(HttpStatus.OK).json({
    message: 'Genre deleted successfully!',
  });
};