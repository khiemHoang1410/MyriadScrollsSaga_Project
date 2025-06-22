import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLanguage } from './api.language';
import { toast } from 'react-hot-toast';

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ languageId, data }: { languageId: string, data: any }) => updateLanguage(languageId, data),
    onSuccess: () => {
      toast.success('Cập nhật ngôn ngữ thành công!');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (err) => toast.error(err.message),
  });
};