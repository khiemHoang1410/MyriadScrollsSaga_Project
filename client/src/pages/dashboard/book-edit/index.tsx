// client/src/pages/book-edit/index.tsx

import { BookForm } from "@/features/book/BookForm";
import { Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export const BookEditPage = () => {
  const { bookId } = useParams();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">
        {bookId ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
      </Typography>
      <Typography>
        ID Sách: {bookId || 'N/A'}
      </Typography>
      {/* Form thêm/sửa sách sẽ được đặt ở đây */}
      <BookForm />
    </Container>
  );
};