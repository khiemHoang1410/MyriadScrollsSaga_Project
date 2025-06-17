// client/src/features/genre/api.genre.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Genre } from './types';

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await axiosInstance.get<{ data: Genre[] }>('/genres');
  return data.data;
};