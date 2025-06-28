// client/src/pages/play/index.tsx
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Alert, Stack, Paper, Button, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { usePlayState } from '@/features/play'; // <-- IMPORT THÊM PlayState
import { ContentBlockRenderer } from '@/features/play/components/ContentBlockRenderer';
import { ChoiceButton } from '@/features/play/components/ChoiceButton';
import { PlayerStatsPane } from '@/features/play/components/PlayerStatsPane';
import { paths } from '@/shared/config/paths';
import { Spinner } from '@/shared/ui/Spinner';
import { BookLayoutType } from '@/features/book';
import type { PlayState } from '@/features/play'; // Import thêm type

// =================================================================
// =======> KHAI BÁO 'CHỨNG MINH NHÂN DÂN' CHO PROPS <=======
interface LayoutProps {
  playState: PlayState;
  onChoiceClick: (choiceId: string) => void;
  isMakingChoice: boolean;
}

// ----- COMPONENT CON CHO LAYOUT PHIÊU LƯU -----

const AdventureLogLayout = ({ playState, onChoiceClick, isMakingChoice }: LayoutProps) => {
  const { currentNode, availableChoices, variablesState } = playState;

  return (
    <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          {currentNode.title && <Typography variant="h4" component="h1" gutterBottom textAlign="center">{currentNode.title}</Typography>}
          {currentNode.contentBlocks.map((block, index) => <ContentBlockRenderer key={index} block={block} />)}
        </Paper>
        {availableChoices.length > 0 && (
          <Stack spacing={1.5} sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2">Lựa chọn của bạn:</Typography>
            {availableChoices.map((choice) => (
              <ChoiceButton key={choice.choiceId} choice={choice} onClick={() => onChoiceClick(choice.choiceId)} disabled={isMakingChoice} />
            ))}
          </Stack>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
      <PlayerStatsPane book={playState.book} variablesState={variablesState} />
      </Grid>
    </Grid>
  );
};

// ----- COMPONENT CON CHO LAYOUT TIỂU THUYẾT -----

const LiteNovelLayout = ({ playState, onChoiceClick, isMakingChoice }: LayoutProps) => {
  const { currentNode, availableChoices } = playState;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        {currentNode.title && <Typography variant="h4" component="h1" gutterBottom textAlign="center">{currentNode.title}</Typography>}
        {currentNode.contentBlocks.map((block, index) => <ContentBlockRenderer key={index} block={block} />)}
      </Paper>
      {availableChoices.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2">Lựa chọn của bạn:</Typography>
          {availableChoices.map((choice) => (
            <ChoiceButton key={choice.choiceId} choice={choice} onClick={() => onChoiceClick(choice.choiceId)} disabled={isMakingChoice} />
          ))}
        </Stack>
      )}
    </Container>
  );
};

// ----- COMPONENT PLAYPAGE CHÍNH -----
export const PlayPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { playState, isLoading, isError, error, makeChoice, isMakingChoice } = usePlayState(slug);

  const bookFont = playState?.book?.fontFamily;
  const playPageTheme = useMemo(() => createTheme({
    typography: { fontFamily: bookFont ? `${bookFont}, "Public Sans", sans-serif` : '"Public Sans", sans-serif' }
  }), [bookFont]);

  if (isLoading) return <Spinner />;
  if (isError) return <Container sx={{ mt: 4 }}><Alert severity="error">Lỗi khi tải câu chuyện: {error instanceof Error ? error.message : 'Unknown error'}</Alert></Container>;
  if (!playState) return <Container sx={{ mt: 4 }}><Alert severity="warning">Không tìm thấy dữ liệu truyện.</Alert></Container>;

  const handleChoiceClick = (choiceId: string) => {
    makeChoice({ slug: slug!, nodeId: playState.currentNode.nodeId, choiceId });
  };

  const isEnding = playState.currentNode.nodeType === 'ending';

  return (
    <ThemeProvider theme={playPageTheme} key={slug}>
      <Box sx={{ bgcolor: '#fdfaef', minHeight: 'calc(100vh - 64px)', p: { xs: 2, md: 4 } }}>
        {playState.book.layoutType === BookLayoutType.ADVENTURE_LOG ? (
          <AdventureLogLayout playState={playState} onChoiceClick={handleChoiceClick} isMakingChoice={isMakingChoice} />
        ) : (
          <LiteNovelLayout playState={playState} onChoiceClick={handleChoiceClick} isMakingChoice={isMakingChoice} />
        )}

        {isEnding && (
          <Box textAlign="center" sx={{ mt: 4, width: '100%' }}>
            <Alert severity="success" sx={{ mb: 3, display: 'inline-flex' }}>
              <Typography fontWeight="bold">KẾT THÚC</Typography>
            </Alert>
            <Typography>Bạn đã đi đến một trong những kết thúc của câu chuyện.</Typography>
            <Button component={Link} to={paths.home} variant="contained" sx={{ mt: 2 }}>
              Quay về Trang chủ
            </Button>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};