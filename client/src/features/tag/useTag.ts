import { useQuery } from '@tanstack/react-query';
import { getTags } from './api.tag';

export const useTags = () => {
  return useQuery({
    queryKey: ['Tags'],
    queryFn: getTags,
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });
};