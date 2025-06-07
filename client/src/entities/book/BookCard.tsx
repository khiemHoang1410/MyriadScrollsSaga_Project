// src/entities/book/BookCard.tsx
import type { Book } from '@/features/book/types';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="194"
        image={book.coverImageUrl || 'https://via.placeholder.com/345x194?text=No+Image'}
        alt={book.title}
      />
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
  );
};