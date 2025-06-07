// src/pages/home/index.tsx
import { BookList } from '@/widgets/BookList/BookList';
import { Typography } from '@mui/material';

export const HomePage = () => {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Khám phá các thế giới
      </Typography>
      <BookList />
    </div>
  );
};