import { useParams } from 'react-router-dom';
import { useBook } from '@/features/book/useBook'; // Đảm bảo import hook mới
import {
    Typography,
    Container,
    CircularProgress,
    Alert,
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip
} from '@mui/material';
// Định nghĩa kiểu cho params để TypeScript hiểu
type BookDetailParams = {
    slug: string; // Đổi từ bookId thành slug
};


export const BookDetailPage = () => {
    // Lấy ra "slug" từ URL
    const { slug } = useParams<BookDetailParams>();

    // Truyền "slug" vào hook useBook
    const { data: bookResponse, isLoading, isError, error } = useBook(slug);

    // ... Phần logic hiển thị (loading, error, success) bên dưới giữ nguyên
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    if (isError) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">
                    Lỗi khi tải dữ liệu sách: {error.message}
                </Alert>
            </Container>
        );
    }

    const book = bookResponse?.data;

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Trang Chi Tiết Sách
            </Typography>
            <Typography variant="body1">
                ID của cuốn sách lấy từ URL là: <strong>{book?.slug}</strong>
            </Typography>
        </Container>
    );
};