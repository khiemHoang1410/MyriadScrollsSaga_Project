// client/src/pages/play/index.tsx

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Alert, Stack, Paper, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { usePlayState } from '@/features/play';
import { ContentBlockRenderer } from '@/features/play/components/ContentBlockRenderer';
import { ChoiceButton } from '@/features/play/components/ChoiceButton';
import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/paths';
import { Spinner } from '@/shared/ui/Spinner';

export const PlayPage = () => {
  // === BƯỚC 1: GỌI TẤT CẢ HOOKS LÊN TRÊN CÙNG ===
  const { slug } = useParams<{ slug: string }>();

  const {
    playState,
    isLoading,
    isError,
    error,
    makeChoice,
    isMakingChoice,
  } = usePlayState(slug);

  // Lấy font ra một cách an toàn, nó sẽ là undefined nếu playState chưa có
  const bookFont = playState?.book?.fontFamily;

  // Hook useMemo cũng phải được gọi ở đây, không nằm trong điều kiện
  const playPageTheme = useMemo(() => {
    return createTheme({
      typography: {
        fontFamily: bookFont ? `"${bookFont}", serif` : '"Public Sans", sans-serif',
        body1: { fontSize: '1.1rem', lineHeight: 1.7 },
      },
    });
  }, [bookFont]); // Dependency là bookFont

  // === BƯỚC 2: CÁC "CỔNG GÁC" (Guard Clauses) ĐỂ XỬ LÝ LOADING VÀ ERROR ===
  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Lỗi khi tải câu chuyện: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!playState) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Không tìm thấy dữ liệu cho câu chuyện này hoặc sách chưa được xuất bản.</Alert>
      </Container>
    );
  }

  // === BƯỚC 3: KHI ĐÃ CÓ DATA, RENDER GIAO DIỆN CHÍNH ===
  const { currentNode, availableChoices } = playState;

  return (
    <ThemeProvider theme={playPageTheme} key={slug}>
      <Box sx={{ bgcolor: '#fdfaef', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {currentNode.title && (
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
              {currentNode.title}
            </Typography>
          )}

          <Paper elevation={3} sx={{ my: 3, p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
            {currentNode.contentBlocks.map((block, index) => (
              <ContentBlockRenderer key={index} block={block} />
            ))}
          </Paper>

          {availableChoices.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 4 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                Lựa chọn của bạn:
              </Typography>
              {availableChoices.map((choice) => (
                <ChoiceButton
                  key={choice.choiceId}
                  choice={choice}
                  onClick={() => makeChoice({ slug: slug!, nodeId: currentNode.nodeId, choiceId: choice.choiceId })}
                  disabled={isMakingChoice}
                />
              ))}
            </Stack>
          )}

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
      </Box>
    </ThemeProvider>
  );
};