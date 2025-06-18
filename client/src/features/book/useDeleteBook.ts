import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBook } from './api.book';
import toast from 'react-hot-toast'; // <-- 1. Import toast

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      // 2. Gọi toast.success để hiển thị thông báo thành công
      toast.success('Sách đã được xóa thành công!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      // 3. Gọi toast.error để hiển thị thông báo lỗi
      toast.error(`Lỗi khi xóa sách: ${error.message}`);
    },
  });
};