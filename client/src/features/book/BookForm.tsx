import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material';

// 1. Định nghĩa "luật" cho form bằng Zod
// Ví dụ: title là bắt buộc, không được để trống.
const bookFormSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề là bắt buộc' }),
  coverImageUrl: z.string().url({ message: 'URL ảnh bìa không hợp lệ' }).optional().or(z.literal('')),
  description: z.string().optional(),
});

// 2. Tự động suy ra kiểu dữ liệu TypeScript từ schema của Zod
type BookFormValues = z.infer<typeof bookFormSchema>;

// Props của component, sẽ dùng cho việc edit sau này
interface BookFormProps {
  // initialData?: BookFormValues; // Sẽ dùng ở bước sau
  // onSubmit: SubmitHandler<BookFormValues>; // Sẽ dùng ở bước sau
  // isPending?: boolean;
  // error?: Error | null;
}

export const BookForm = ({}: BookFormProps) => {
  // 3. Khởi tạo react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // Lấy ra errors và trạng thái submit
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema), // Tích hợp Zod để validation
  });

  // 4. Hàm này sẽ được gọi khi form hợp lệ và được submit
  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    // Tạm thời chỉ in ra console để kiểm tra
    console.log('Form data submitted:', data); 
    // Ở các bước sau, chúng ta sẽ gọi API ở đây
  };

  return (
    // 5. Gắn handleSubmit vào sự kiện onSubmit của form
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, maxWidth: '800px' }}>
      
      <TextField
        {...register('title')} // 6. Đăng ký input này với react-hook-form
        label="Tiêu đề sách"
        fullWidth
        required
        margin="normal"
        error={!!errors.title} // Hiển thị trạng thái lỗi
        helperText={errors.title?.message} // Hiển thị thông báo lỗi
      />
      
      <TextField
        {...register('coverImageUrl')}
        label="URL ảnh bìa"
        fullWidth
        margin="normal"
        error={!!errors.coverImageUrl}
        helperText={errors.coverImageUrl?.message}
      />

      <TextField
        {...register('description')}
        label="Mô tả"
        fullWidth
        multiline
        rows={6}
        margin="normal"
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi
        sx={{ mt: 2 }}
        startIcon={isSubmitting ? <CircularProgress size="1rem" color="inherit" /> : null}
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </Box>
  );
};