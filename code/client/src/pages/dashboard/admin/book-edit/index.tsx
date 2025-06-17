// client/src/pages/book-edit/index.tsx

import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';

import { BookForm } from '@/features/book/BookForm';
import { useBook } from '@/features/book/useBook'; // Hook để lấy dữ liệu 1 sách
import { Spinner } from '@/shared/ui/Spinner';     // Spinner component mình đã có

/**
 * Trang dùng để Thêm mới hoặc Chỉnh sửa một cuốn sách.
 * Nó sẽ kiểm tra `bookId` từ URL để quyết định chế độ hoạt động.
 */
export const BookEditPage = () => {
  console.log('--- BÁO CÁO: ĐÃ VÀO ĐƯỢC BOOK EDIT PAGE ---'); // <-- THÊM DÒNG NÀY

  // 1. Lấy `bookId` từ URL. Nếu là trang "Thêm mới", `bookId` sẽ là `undefined`.
  const { bookId } = useParams<{ bookId: string }>();

  // 2. Xác định xem có phải đang ở chế độ chỉnh sửa không.
  const isEditMode = !!bookId;

  // 3. Chỉ gọi hook `useBook` để fetch dữ liệu nếu đang ở chế độ chỉnh sửa.
  //    `enabled: isEditMode` đảm bảo query chỉ chạy khi isEditMode là true.
  const { data: book, isLoading, isError, error } = useBook(bookId, {
    enabled: isEditMode,
  });

  // 4. Xử lý các trạng thái loading và error một cách chuyên nghiệp.
  //    Hiển thị spinner cho người dùng biết app đang tải dữ liệu.
  if (isLoading) {
    return <Spinner />;
  }

  // Hiển thị lỗi nếu không fetch được dữ liệu sách.
  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Lỗi khi tải dữ liệu sách: {error.message}</Alert>
      </Container>
    );
  }

  // 5. Render giao diện chính.
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
      </Typography>
      
      <Box sx={{ my: 2 }}>
        {/*
          - Nếu là chế độ edit, truyền cả `initialData` và `bookId` xuống cho form.
          - Nếu là chế độ thêm mới, không truyền gì cả, form sẽ tự hiểu là form trống.
        */}
        <BookForm 
          initialData={isEditMode ? book : undefined}           
          bookId={bookId} 
        />
      </Box>
    </Container>
  );
};