// client/src/widgets/BookPreviewPane/index.tsx

import { Box, Paper, Typography, CardMedia, Divider } from '@mui/material';
import type { Book } from '@/features/book/types';

interface BookPreviewPaneProps {
  book: Book | null; // Có thể là null nếu chưa có sách nào được chọn
}

export const BookPreviewPane = ({ book }: BookPreviewPaneProps) => {
  // Nếu chưa có sách nào được chọn, hiển thị một thông báo
  if (!book) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Click vào một sách trong danh sách để xem trước
        </Typography>
      </Paper>
    );
  }

  // Nếu có sách được chọn, hiển thị thông tin
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {book.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        bởi {book.author.username}
      </Typography>
      
      <CardMedia
        component="img"
        image={book.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Image'}
        alt={`Bìa sách ${book.title}`}
        sx={{ borderRadius: 1, width: '100%', height: 'auto', mb: 2 }}
      />
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body1" paragraph>
        {book.description || 'Chưa có mô tả.'}
      </Typography>
    </Paper>
  );
};