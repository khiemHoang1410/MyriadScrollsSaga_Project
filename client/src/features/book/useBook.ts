// client/src/features/book/useBook.ts (File MỚI)

import { useQuery } from '@tanstack/react-query';
import { getBookById } from './api.book';

/**
 * Custom hook để lấy dữ liệu cho MỘT cuốn sách bằng slug (hoặc ID).
 * @param identifier - slug hoặc ID của cuốn sách.
 */
export const useBook = (identifier: string | undefined) => {
  return useQuery({
    queryKey: ['book', identifier],
    queryFn: () => getBookById(identifier!),
    enabled: !!identifier,
  });
};