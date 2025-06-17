import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBook } from './api.book';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      console.log('Xóa sách thành công!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      console.error('Lỗi khi xóa sách:', error);
    },
  });
};
