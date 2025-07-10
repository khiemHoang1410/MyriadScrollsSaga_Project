// client/src/features/book/form-sections/BookForm_ContentJson.tsx

import { TextField, Paper, Typography, Stack } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { type BookFormValues } from '../BookForm';

interface Props {
  isPending: boolean;
}

// Helper function để lấy message lỗi an toàn
const getHelperText = (error: any): string | undefined => {
    if (!error) return undefined;
    if (typeof error.message === 'string') {
      return error.message;
    }
    return 'Invalid JSON format';
  };

export const BookForm_ContentJson = ({ isPending }: Props) => {
  const {
      
    register,
    formState: { errors },
  } = useFormContext<BookFormValues>();

  return (
    <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
      <Typography variant="h6" gutterBottom>
        Nội Dung Truyện (JSON)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Đây là khu vực tạm thời để nhập nội dung và biến của truyện. Trong tương lai, nó sẽ được thay thế bằng trình soạn thảo kéo-thả trực quan.
      </Typography>

      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          {...register('storyNodes')}
          label="Nội dung các nút truyện (Story Nodes)"
          fullWidth
          multiline
          rows={15}
          disabled={isPending}
          error={!!errors.storyNodes}
          helperText={getHelperText(errors.storyNodes)}
          placeholder='Dán một mảng JSON chứa các page node vào đây. Ví dụ: [{ "nodeId": "start", ... }]'
          variant="filled" // Dùng variant "filled" cho nó khác biệt
        />

        <TextField
          {...register('storyVariables')}
          label="Các biến của truyện (Story Variables)"
          fullWidth
          multiline
          rows={5}
          disabled={isPending}
          error={!!errors.storyVariables}
          helperText={getHelperText(errors.storyVariables)}
          placeholder='Dán một mảng JSON chứa các biến vào đây. Ví dụ: [{ "name": "score", ... }]'
          variant="filled"
        />
      </Stack>
    </Paper>
  );
};