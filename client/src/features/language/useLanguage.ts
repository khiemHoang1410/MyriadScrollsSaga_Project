import { useQuery } from '@tanstack/react-query';
import { getLanguages } from './api.language';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });
};