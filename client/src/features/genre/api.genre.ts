// client/src/features/genre/api.genre.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Genre, CreateGenreInput, UpdateGenreInput } from './types';

// GET ALL
export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await axiosInstance.get<{ data: Genre[] }>('/genres');
  return data.data;
};

// CREATE
export const createGenre = async (genreData: CreateGenreInput): Promise<Genre> => {
  const { data } = await axiosInstance.post<{ data: Genre }>('/genres', genreData);
  return data.data;
};

// UPDATE
export const updateGenre = async (genreId: string, genreData: UpdateGenreInput): Promise<Genre> => {
  const { data } = await axiosInstance.put<{ data: Genre }>(`/genres/${genreId}`, genreData);
  return data.data;
};

// DELETE
export const deleteGenre = async (genreId: string): Promise<void> => {
  await axiosInstance.delete(`/genres/${genreId}`);
};