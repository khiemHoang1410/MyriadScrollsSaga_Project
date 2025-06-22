import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLanguage } from './api.language';
import { toast } from 'react-hot-toast';

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      toast.success('Xóa ngôn ngữ thành công!');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (err) => toast.error(err.message),
  });
};