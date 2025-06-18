// client/src/features/book/useUpdateBook.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updateBook } from './api.book';
import type { UpdateBookInput, Book } from './types';
import { paths } from '@/shared/config/paths';

/**
 * Custom hook để xử lý logic cập nhật một cuốn sách.
 * @returns {object} Trả về mutation object từ React Query.
 */
export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (variables: { bookId: string; bookData: UpdateBookInput }) =>
      updateBook(variables),
    
    /**
     * @param {Book} updatedBook - Dữ liệu sách đã được cập nhật trả về từ API.
     */
    onSuccess: (updatedBook: Book) => {
      console.log('Sách đã được cập nhật thành công!');

      // Vô hiệu hóa cache của danh sách sách nói chung.
      queryClient.invalidateQueries({ queryKey: ['books'] });

      // 💡 Pro-tip: Vô hiệu hóa cache của CHÍNH CUỐN SÁCH vừa được sửa.
      // Điều này đảm bảo nếu người dùng quay lại trang chi tiết sách,
      // họ sẽ thấy dữ liệu mới nhất ngay lập tức.
      queryClient.invalidateQueries({ queryKey: ['book', updatedBook._id] });
      queryClient.invalidateQueries({ queryKey: ['book', updatedBook.slug] });

      navigate(paths.admin.manageBooks);
    },
    
    onError: (error: Error) => {
      console.error('Lỗi khi cập nhật sách:', error);
    },
  });
};