// client/src/features/play/components/ContentBlockRenderer.tsx

import { CardMedia, Paper, Typography } from '@mui/material';
import type { ContentBlock } from '../types';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

/**
 * Component này nhận vào một content block và quyết định cách render nó
 * dựa trên thuộc tính 'type'.
 */
export const ContentBlockRenderer = ({ block }: ContentBlockRendererProps) => {
  switch (block.type) {
    case 'text':
      return (
        <Typography variant="body1" paragraph>
          {block.value}
        </Typography>
      );

    case 'image':
      return (
        <CardMedia
          component="img"
          image={block.value}
          alt="Story image"
          sx={{ borderRadius: 1, my: 2, maxWidth: '100%', height: 'auto' }}
        />
      );

    case 'dialogue':
      return (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
          }}
        >
          {block.characterName && (
            <Typography variant="subtitle2" component="p" sx={{ fontWeight: 'bold' }}>
              {block.characterName}:
            </Typography>
          )}
          <Typography variant="body1" component="p" sx={{ fontStyle: 'italic' }}>
            "{block.value}"
          </Typography>
        </Paper>
      );

    case 'audio_sfx':
    case 'audio_bgm':
      // TODO: Implement audio playback logic here in the future
      // For now, it renders nothing visible.
      return null;

    default:
      // Xử lý các block type không xác định một cách an toàn
      return null;
  }
};