import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLanguage } from './api.language';
import { toast } from 'react-hot-toast';

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      toast.success('Tạo ngôn ngữ thành công!');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (err) => toast.error(err.message),
  });
};