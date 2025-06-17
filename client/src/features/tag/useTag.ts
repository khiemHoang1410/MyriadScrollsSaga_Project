// client/src/features/tag/useTags.ts
import { useQuery } from '@tanstack/react-query';
import { getTags } from './api.tag';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });
};