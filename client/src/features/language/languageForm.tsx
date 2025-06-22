import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack, TextField } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import type { Language } from './types';

const languageSchema = z.object({
  name: z.string().min(1, 'Tên ngôn ngữ là bắt buộc'),
  code: z.string().min(2, 'Mã ngôn ngữ là bắt buộc (ví dụ: en, vi)').max(5),
  description: z.string().optional(),
});

type LanguageFormValues = z.infer<typeof languageSchema>;

interface LanguageFormProps {
  onSubmit: (data: LanguageFormValues) => void;
  initialData?: Language;
  isPending: boolean;
}

export const LanguageForm = ({ onSubmit, initialData, isPending }: LanguageFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: initialData || { name: '', code: '', description: '' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      <Stack spacing={2}>
        <TextField {...register('name')} autoFocus margin="dense" label="Tên ngôn ngữ *" fullWidth error={!!errors.name} helperText={errors.name?.message} disabled={isPending}/>
        <TextField {...register('code')} margin="dense" label="Mã ngôn ngữ (code) *" fullWidth error={!!errors.code} helperText={errors.code?.message} disabled={isPending}/>
        <TextField {...register('description')} margin="dense" label="Mô tả" fullWidth multiline rows={3} disabled={isPending}/>
        <Button type="submit" variant="contained" disabled={isPending} sx={{ mt: 2 }}>
          {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </Stack>
    </Box>
  );
};