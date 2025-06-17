// client/src/features/genre/useGenres.ts
import { useQuery } from '@tanstack/react-query';
import { getGenres } from './api.genre';

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });
};