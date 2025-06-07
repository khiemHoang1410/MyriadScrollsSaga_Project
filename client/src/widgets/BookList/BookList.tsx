// src/widgets/BookList/BookList.tsx

import { useBooks } from '@/features/book/useBooks';
import { BookCard } from '@/entities/book/BookCard';

// Import các component cần thiết từ MUI
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

export const BookList = () => {
  // Sửa ở đây: Truyền tham số vào cho useBooks
  const { data, isLoading, isError, error } = useBooks({ status: 'published' });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi không xác định xảy ra.';
    return <Alert severity="error">Lỗi khi tải danh sách truyện: {errorMessage}</Alert>;
  }
  
  const books = data?.data || [];

  if (books.length === 0) {
    return <Typography sx={{ my: 4 }}>Chưa có truyện nào được xuất bản.</Typography>
  }

  // Sửa ở đây: Dùng Box với display: 'grid' thay cho component Grid
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)', // 1 cột trên màn hình nhỏ nhất
          sm: 'repeat(2, 1fr)', // 2 cột trên màn hình nhỏ
          md: 'repeat(3, 1fr)', // 3 cột trên màn hình vừa
          lg: 'repeat(4, 1fr)', // 4 cột trên màn hình lớn
        },
        gap: 3, // Khoảng cách giữa các item
      }}
    >
      {books.map((book) => (
        <BookCard book={book} key={book._id} />
      ))}
    </Box>
  );
};