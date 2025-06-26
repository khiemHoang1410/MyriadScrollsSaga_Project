// client/src/pages/book-edit/index.tsx

import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { BookForm } from '@/features/book/BookForm';
import { useBook } from '@/features/book/useBook';
import { useLanguages } from '@/features/language';
import { useGenres } from '@/features/genre';
import { useTags } from '@/features/tag';
import { Spinner } from '@/shared/ui/Spinner';

export const BookEditPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const isEditMode = !!bookId;

  // Gọi tất cả các hook để lấy dữ liệu cần thiết
  const { data: book, isLoading: isLoadingBook } = useBook(bookId, { enabled: isEditMode });
  const { data: languages, isLoading: isLoadingLangs } = useLanguages();
  const { data: genres, isLoading: isLoadingGenres } = useGenres();
  const { data: tags, isLoading: isLoadingTags } = useTags();

  const isDataLoading = isLoadingBook || isLoadingLangs || isLoadingGenres || isLoadingTags;

  if (isDataLoading && isEditMode) {
    return <Spinner />;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
      </Typography>
      <Box sx={{ my: 2 }}>
        <BookForm
          initialData={isEditMode ? book : undefined}
          bookId={bookId}
          languages={languages}
          genres={genres}
          tags={tags}
          isDataLoading={isDataLoading}
        />
      </Box>
    </Container>
  );
};