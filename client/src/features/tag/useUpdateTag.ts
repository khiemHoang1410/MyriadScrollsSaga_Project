import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTag } from './api.tag';
import { toast } from 'react-hot-toast';

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string, data: any }) => updateTag(tagId, data),
    onSuccess: () => {
      toast.success('Cập nhật nhãn thành công!');
      queryClient.invalidateQueries({ queryKey: ['Tags'] });
    },
    onError: (err) => toast.error(err.message),
  });
};