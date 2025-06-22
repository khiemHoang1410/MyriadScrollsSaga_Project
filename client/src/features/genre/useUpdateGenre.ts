import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGenre } from './api.genre';
import { toast } from 'react-hot-toast';

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ genreId, data }: { genreId: string, data: any }) => updateGenre(genreId, data),
    onSuccess: () => {
      toast.success('Cập nhật thể loại thành công!');
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: (err) => toast.error(err.message),
  });
};