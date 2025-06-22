import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack, TextField } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import type { Genre } from './types';

const genreSchema = z.object({
  name: z.string().min(1, 'Tên thể loại là bắt buộc'),
  description: z.string().optional(),
});

type GenreFormValues = z.infer<typeof genreSchema>;

interface GenreFormProps {
  onSubmit: (data: GenreFormValues) => void;
  initialData?: Genre;
  isPending: boolean;
}

export const GenreForm = ({ onSubmit, initialData, isPending }: GenreFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<GenreFormValues>({
    resolver: zodResolver(genreSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      <Stack spacing={2}>
        <TextField
          {...register('name')}
          autoFocus
          margin="dense"
          label="Tên thể loại *"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          disabled={isPending}
        />
        <TextField
          {...register('description')}
          margin="dense"
          label="Mô tả"
          fullWidth
          multiline
          rows={3}
          disabled={isPending}
        />
        <Button type="submit" variant="contained" disabled={isPending} sx={{ mt: 2 }}>
          {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </Stack>
    </Box>
  );
};