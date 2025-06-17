// client/src/features/book/BookForm.tsx

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, CircularProgress, Stack, TextField } from '@mui/material';
import { Button } from '@/shared/ui/Button';

import { useCreateBook } from './useCreateBook';
import { useUpdateBook } from './useUpdateBook';
import type { Book } from './types';

// =================================================================
// 1. VALIDATION SCHEMA
// =================================================================
// Vẫn giữ Zod schema như cũ, ta sẽ mở rộng sau khi thêm các trường khác
const bookFormSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề là bắt buộc' }),
  description: z.string().optional(),
  coverImageUrl: z.string().url({ message: 'URL ảnh bìa không hợp lệ' }).optional().or(z.literal('')),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

// =================================================================
// 2. PROPS INTERFACE
// =================================================================
/**
 * Props cho BookForm.
 * @param {Book} [initialData] - Dữ liệu sách ban đầu. Nếu có, form sẽ ở chế độ "Chỉnh sửa".
 * @param {string} [bookId] - ID của sách. Cần thiết cho chế độ "Chỉnh sửa".
 */
interface BookFormProps {
  initialData?: Book;
  bookId?: string;
}

// =================================================================
// 3. COMPONENT CHÍNH
// =================================================================
export const BookForm = ({ initialData, bookId }: BookFormProps) => {
  // --- A. HOOKS & STATE ---
  // Xác định chế độ của form: true nếu có initialData (chỉnh sửa), false nếu không (thêm mới)
  const isEditMode = !!initialData;

  // Gọi các mutation hook mà mình đã tạo
  const { mutate: createBook, isPending: isCreating, error: createError } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating, error: updateError } = useUpdateBook();

  // Kết hợp trạng thái loading và lỗi từ cả hai mutation
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  // --- B. CẤU HÌNH FORM ---
  const {
    register,
    handleSubmit,
    reset, // Lấy thêm hàm reset từ useForm
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    // Set giá trị mặc định cho form. Nếu là chế độ edit, dùng initialData.
    defaultValues: isEditMode
      ? {
          title: initialData.title,
          description: initialData.description || '',
          coverImageUrl: initialData.coverImageUrl || '',
        }
      : {
          title: '',
          description: '',
          coverImageUrl: '',
        },
  });

  // useEffect để cập nhật lại form nếu initialData thay đổi (ví dụ khi user chuyển từ trang edit sách A sang B)
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        coverImageUrl: initialData.coverImageUrl || '',
      });
    }
  }, [initialData, reset]);


  // --- C. XỬ LÝ SUBMIT ---
  // Hàm này sẽ được gọi khi form hợp lệ và được submit
  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    if (isEditMode && bookId) {
      // Chế độ chỉnh sửa: gọi mutation updateBook
      console.log('Updating book with ID:', bookId, 'and data:', data);
      updateBook({ bookId, bookData: data });
    } else {
      // Chế độ thêm mới: gọi mutation createBook
      console.log('Creating book with data:', data);
      // createBook(data); // Bỏ comment khi đã thêm đủ các trường required ở backend
      alert('Chức năng tạo sách cần thêm các trường bắt buộc như Language, Start Node ID... Sẽ làm ở bước sau!');
    }
  };

  // --- D. GIAO DIỆN FORM ---
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, maxWidth: '800px' }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{(error as any).message || 'Có lỗi xảy ra'}</Alert>}

        <TextField
          {...register('title')}
          label="Tiêu đề sách"
          fullWidth
          required
          margin="normal"
          error={!!errors.title}
          helperText={errors.title?.message}
          disabled={isPending}
        />

        <TextField
          {...register('coverImageUrl')}
          label="URL ảnh bìa"
          fullWidth
          margin="normal"
          error={!!errors.coverImageUrl}
          helperText={errors.coverImageUrl?.message}
          disabled={isPending}
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
          disabled={isPending}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isPending}
          sx={{ mt: 2 }}
          startIcon={isPending ? <CircularProgress size="1rem" color="inherit" /> : null}
        >
          {isPending ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sách' : 'Tạo sách mới')}
        </Button>
      </Stack>
    </Box>
  );
};