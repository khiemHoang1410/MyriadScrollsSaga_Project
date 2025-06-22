import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGenre } from './api.genre';
import { toast } from 'react-hot-toast';

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      toast.success('Tạo thể loại thành công!');
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: (err) => toast.error(err.message),
  });
};