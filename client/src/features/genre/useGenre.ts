import { useQuery } from '@tanstack/react-query';
import { getGenres } from './api.genre';

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });
};