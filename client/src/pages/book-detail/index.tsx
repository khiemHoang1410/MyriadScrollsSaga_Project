import { Link, useParams } from 'react-router-dom';
import { useBook } from '@/features/book/useBook';

// Import các component từ MUI, lần này chúng ta không dùng Grid
import {
  Typography,
  Container,
  CircularProgress,
  Alert,
  Box,
  CardMedia,
  Chip,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { paths } from '@/shared/config/paths';

type BookDetailParams = {
  slug: string;
};

export const BookDetailPage = () => {
  const { slug } = useParams<BookDetailParams>();
  const { data: book, isLoading, isError, error } = useBook(slug);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Lỗi khi tải dữ liệu sách: {error.message}</Alert>
      </Container>
    );
  }

  const formattedDate = book?.createdAt
    ? new Date(book.createdAt).toLocaleDateString('vi-VN')
    : 'Không rõ';

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* THAY THẾ GRID BẰNG BOX VỚI FLEXBOX */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Xếp dọc trên màn nhỏ, ngang trên màn lớn
          gap: 4, // Khoảng cách giữa 2 cột
        }}
      >
        {/* CỘT BÊN TRÁI: ẢNH BÌA */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={book?.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Image'}
            alt={book?.title}
            sx={{ borderRadius: 2, width: '100%', height: 'auto' }}
          />
        </Box>

        {/* CỘT BÊN PHẢI: THÔNG TIN CHI TIẾT */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {book?.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tác giả: {book?.author.username}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ my: 2 }}>
            {book?.genres?.map((genre) => (
              <Chip key={genre._id} label={genre.name} sx={{ mr: 1, mb: 1 }} color="primary" />
            ))}
            {book?.tags?.map((tag) => (
              <Chip key={tag._id} label={tag.name} sx={{ mr: 1, mb: 1 }} variant="outlined" />
            ))}
          </Box>
          <Stack direction="row" spacing={3} sx={{ my: 3, color: 'text.secondary', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ThermostatIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Độ khó: {book?.difficulty || 'Chưa xác định'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarBorderIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Đánh giá: {book?.averageRating} / 5</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">{book?.viewsCount} lượt xem</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarTodayIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Ngày đăng: {formattedDate}</Typography>
            </Box>
          </Stack>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {book?.description || 'Chưa có mô tả cho cuốn sách này.'}
          </Typography>
          <Button
            component={Link} // 1. Biến Button thành một thẻ Link
            to={book ? paths.play(book.slug) : '#'} // 2. Trỏ đến đúng đường dẫn chơi game
            variant="contained"
            color="success"
            size="large"
            sx={{ mt: 3 }}
            disabled={!book} // 3. Vô hiệu hóa nếu chưa có data sách
          >
            Bắt đầu đọc
          </Button>
        </Box>
      </Box>
    </Container>
  );
};