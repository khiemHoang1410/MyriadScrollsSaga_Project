// File: client/src/widgets/BookList/BookList.tsx (FIXED)

import { useBooks } from '@/features/book/useBooks';
import { BookCard } from '@/entities/book/BookCard';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { type Book } from '@/features/book/types'; // Import Book type
import { Box } from '@mui/material';

export const BookList = () => {
  // SỬA 1: Luôn truyền vào một object cho params, dù là rỗng.
  // Đồng thời đổi tên `data` thành `booksResponse` để code rõ ràng hơn.
  const { data: booksResponse, isLoading, isError, error } = useBooks({ status: 'published' });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ErrorMessage message={(error as any)?.message} />;
  }
  
  // SỬA 2: Lấy mảng sách từ `booksResponse.data`.
  // Lỗi "map does not exist" sẽ được khắc phục ở đây.
  const books = booksResponse?.data || [];

  // Khi Sửa 2 đã đúng, TypeScript sẽ tự hiểu `book` là kiểu Book
  // Lỗi "implicitly has an 'any' type" sẽ tự biến mất.
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {books.map((book: Book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </Box>
  );
};