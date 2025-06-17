// client/src/widgets/BookPreviewPane/index.tsx

import { Box, Paper, Typography, CardMedia, Divider } from '@mui/material';
import type { Book } from '@/features/book/types';
import ImageIcon from '@mui/icons-material/Image'; // Import icon ảnh

interface BookPreviewPaneProps {
  book: Book | null; // Có thể là null nếu chưa có sách nào được chọn
}

const ImagePlaceholder = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      // Giữ tỉ lệ ảnh 2:3 cho đẹp
      aspectRatio: '2 / 3',
      backgroundColor: 'grey.200', // Màu nền xám nhạt
      borderRadius: 1,
      mb: 2,
    }}
  >
    <ImageIcon sx={{ fontSize: 60, color: 'grey.500' }} />
    <Typography variant="caption" color="text.secondary">
      No Image
    </Typography>
  </Box>
);

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

      {/* === FIX Ở ĐÂY: DÙNG TOÁN TỬ 3 NGÔI ĐỂ RENDER CÓ ĐIỀU KIỆN === */}
      {book.coverImageUrl ? (
        // Nếu CÓ link ảnh, render CardMedia
        <CardMedia
          component="img"
          image={book.coverImageUrl}
          alt={`Bìa sách ${book.title}`}
          sx={{ borderRadius: 1, width: '100%', height: 'auto', mb: 2 }}
        />
      ) : (
        // Nếu KHÔNG có link ảnh, render component placeholder của mình
        <ImagePlaceholder />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1" paragraph>
        {book.description || 'Chưa có mô tả.'}
      </Typography>
    </Paper>
  );
};