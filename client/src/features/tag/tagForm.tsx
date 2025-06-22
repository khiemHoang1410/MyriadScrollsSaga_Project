import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack, TextField } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import type { Tag } from './types';

const tagSchema = z.object({
  name: z.string().min(1, 'Tên thẻ là bắt buộc'),
  description: z.string().optional(),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagFormProps {
  onSubmit: (data: TagFormValues) => void;
  initialData?: Tag;
  isPending: boolean;
}

export const TagForm = ({ onSubmit, initialData, isPending }: TagFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      <Stack spacing={2}>
        <TextField {...register('name')} autoFocus margin="dense" label="Tên thẻ *" fullWidth error={!!errors.name} helperText={errors.name?.message} disabled={isPending}/>
        <TextField {...register('description')} margin="dense" label="Mô tả" fullWidth multiline rows={3} disabled={isPending}/>
        <Button type="submit" variant="contained" disabled={isPending} sx={{ mt: 2 }}>
          {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </Stack>
    </Box>
  );
};