// client/src/features/language/useLanguages.ts
import { useQuery } from '@tanstack/react-query';
import { getLanguages } from './api.language';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
    select: (data) => data.data, // Chỉ lấy mảng data thôi
  });
};