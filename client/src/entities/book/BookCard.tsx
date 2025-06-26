// src/entities/book/BookCard.tsx
import type { Book } from '@/features/book/types';
import { ImagePlaceholder } from '@/shared/ui/ImagePlaceholder';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/books/${book.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {book.coverImageUrl ? (
          <CardMedia
            component="img"
            sx={{ height: 194 }} // Chuyển height vào sx prop
            image={book.coverImageUrl}
            alt={book.title}
          />
        ) : (
          // Dùng placeholder với chiều cao cố định
          <ImagePlaceholder sx={{ height: 194, minHeight: 194 }} />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tác giả: {book.author.username}
          </Typography>
          <Typography variant="body2" color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {book.description || 'Chưa có mô tả.'}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};