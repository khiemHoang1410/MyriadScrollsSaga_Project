// client/src/features/book/form-sections/BookForm_BasicInfo.tsx

import { TextField, Paper, Typography, Stack } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { type BookFormValues } from '../BookForm'; // Import "khuôn" dữ liệu từ form cha

// Props của component này rất đơn giản, chỉ cần biết form có đang "bận" hay không
interface Props {
  isPending: boolean;
}

export const BookForm_BasicInfo = ({ isPending }: Props) => {
  // Dùng "siêu năng lực" của useFormContext để lấy đồ nghề từ "nhạc trưởng" FormProvider
  const {
    register, // Để đăng ký input
    formState: { errors }, // Để lấy lỗi validation
  } = useFormContext<BookFormValues>();

  return (
    // Bọc trong Paper cho nó có cái khung đẹp
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thông tin cơ bản
      </Typography>

      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          {...register('title')}
          label="Tiêu đề sách *"
          fullWidth
          disabled={isPending}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <TextField
          {...register('coverImageUrl')}
          label="URL ảnh bìa"
          fullWidth
          disabled={isPending}
          error={!!errors.coverImageUrl}
          helperText={errors.coverImageUrl?.message}
        />
        <TextField
          {...register('description')}
          label="Mô tả"
          fullWidth
          multiline
          rows={4}
          disabled={isPending}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <TextField
          {...register('startNodeId')}
          label="Start Node ID *"
          fullWidth
          required
          disabled={isPending}
          error={!!errors.startNodeId}
          helperText={errors.startNodeId?.message}
        />
      </Stack>
    </Paper>
  );
};