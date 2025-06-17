// client/src/features/book/useBook.ts

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getBook, type GetBookResponse } from './api.book';
import type { Book } from './types';

// Thêm options để có thể bật/tắt query
export const useBook = (
  identifier: string | undefined,
  options?: Omit<UseQueryOptions<GetBookResponse, Error, Book>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['book', identifier],
    queryFn: () => getBook(identifier!),
    // Chỉ chạy query này khi `identifier` tồn tại
    enabled: !!identifier,
    // Gộp các options từ bên ngoài truyền vào
    ...options,
    // Thêm select để chỉ trả về data.data, giúp component nhận được object Book trực tiếp
    select: (data) => data.data,
  });
};