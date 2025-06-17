// src/features/book/useBooks.ts

import { useQuery } from '@tanstack/react-query';
// Tách import ra làm 2 dòng
import { getBooks } from './api.book';
import type { GetBooksParams } from './types'; // Thêm "type"

export const useBooks = (params: GetBooksParams) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => getBooks(params),
  });
};