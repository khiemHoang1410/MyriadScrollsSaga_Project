import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTag } from './api.tag';
import { toast } from 'react-hot-toast';

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      toast.success('Xóa nhãn thành công!');
      queryClient.invalidateQueries({ queryKey: ['Tags'] });
    },
    onError: (err) => toast.error(err.message),
  });
};