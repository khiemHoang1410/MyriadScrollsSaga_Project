import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGenre } from './api.genre';
import { toast } from 'react-hot-toast';

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      toast.success('Xóa thể loại thành công!');
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: (err) => toast.error(err.message),
  });
};