// client/src/pages/play/index.tsx

import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Stack, Paper, Button } from '@mui/material';
import { usePlayState } from '@/features/play';
import { ContentBlockRenderer } from '@/features/play/components/ContentBlockRenderer';
import { ChoiceButton } from '@/features/play/components/ChoiceButton';
import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/paths';

/**
 * Trang chính để người dùng trải nghiệm câu chuyện tương tác.
 * Nó lấy dữ liệu từ hook `usePlayState` và render ra các khối nội dung và lựa chọn.
 */
export const PlayPage = () => {
  // 1. Lấy slug của cuốn sách từ URL
  const { slug } = useParams<{ slug: string }>();

  // 2. Gọi hook "trung tâm" để lấy tất cả dữ liệu và logic
  const {
    playState,
    isLoading,
    isError,
    error,
    makeChoice,
    isMakingChoice,
  } = usePlayState(slug);

  // 3. Xử lý trạng thái loading một cách chuyên nghiệp
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 4. Xử lý trạng thái lỗi
  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Lỗi khi tải câu chuyện: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  // Nếu không có playState (ví dụ: slug không đúng hoặc sách chưa sẵn sàng)
  if (!playState) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Không tìm thấy dữ liệu cho câu chuyện này hoặc sách chưa được xuất bản.</Alert>
      </Container>
    );
  }

  const { currentNode, availableChoices } = playState;

  // 5. Render giao diện chính
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Hiển thị tiêu đề của node truyện hiện tại */}
      {currentNode.title && (
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {currentNode.title}
        </Typography>
      )}

      {/* Box chứa nội dung chính của câu chuyện */}
      <Paper elevation={3} sx={{ my: 3, p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        {/* Dùng .map để render từng khối nội dung */}
        {currentNode.contentBlocks.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} />
        ))}
      </Paper>

      {/* Khu vực hiển thị các lựa chọn */}
      {availableChoices.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Lựa chọn của bạn:
          </Typography>
          {/* Dùng .map để render từng nút lựa chọn */}
          {availableChoices.map((choice) => (
            <ChoiceButton
              key={choice.choiceId}
              choice={choice}
              onClick={() => makeChoice({
                slug: slug!,
                nodeId: currentNode.nodeId,
                choiceId: choice.choiceId
              })}
              disabled={isMakingChoice} // Vô hiệu hóa tất cả các nút khi đang chờ API trả về
            />
          ))}
        </Stack>
      )}

      {/* Hiển thị khi truyện kết thúc */}
      {currentNode.nodeType === 'ending' && (
        <Box textAlign="center" sx={{ mt: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
                <Typography fontWeight="bold">KẾT THÚC</Typography>
                Bạn đã đi đến một trong những kết thúc của câu chuyện.
            </Alert>
            <Button component={Link} to={paths.home} variant="contained">
                Quay về Trang chủ
            </Button>
        </Box>
      )}
    </Container>
  );
};