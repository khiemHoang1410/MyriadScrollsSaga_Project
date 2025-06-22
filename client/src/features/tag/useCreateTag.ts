import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTag } from './api.tag';
import { toast } from 'react-hot-toast';

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      toast.success('Tạo nhãn thành công!');
      queryClient.invalidateQueries({ queryKey: ['Tags'] });
    },
    onError: (err) => toast.error(err.message),
  });
};