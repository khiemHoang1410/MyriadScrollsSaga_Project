// client/src/features/book/useCreateBook.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBook } from './api.book';
import type { CreateBookInput } from './types';

/**
 * Custom hook để xử lý logic tạo sách mới.
 * Bao gồm việc gọi API, và xử lý sau khi thành công hoặc thất bại.
 * @returns {object} Trả về mutation object từ React Query.
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    // mutationFn chỉ định hàm sẽ được gọi khi thực thi mutation.
    // React Query sẽ tự động truyền các biến từ hàm `mutate` vào đây.
    mutationFn: (bookData: CreateBookInput) => createBook(bookData),

    /**
     * onSuccess được gọi khi mutation thành công.
     */
    onSuccess: () => {
      // 💡 Pro-tip: Đây là "phép thuật" của React Query.
      // `invalidateQueries` báo cho React Query rằng dữ liệu thuộc về queryKey 'books'
      // đã cũ (stale) và cần được fetch lại vào lần tới khi nó được yêu cầu.
      // Điều này đảm bảo danh sách sách ở trang ManageBooksPage luôn được cập nhật.
      queryClient.invalidateQueries({ queryKey: ['books'] });

      // TODO: Thay thế alert bằng một hệ thống thông báo "xịn" hơn (toast/snackbar)
      console.log('Sách đã được tạo thành công!');
      
      // Điều hướng người dùng về trang quản lý sách sau khi thành công.
      navigate('/dashboard/admin/manage-books');
    },

    /**
     * onError được gọi khi mutation thất bại.
     * @param {Error} error - Đối tượng lỗi trả về.
     */
    onError: (error: Error) => {
      // Log lỗi chi tiết cho dev.
      console.error('Lỗi khi tạo sách:', error);
      
      // TODO: Hiển thị thông báo lỗi thân thiện cho người dùng.
      // Ví dụ: showErrorToast(error.message);
    },
  });
};