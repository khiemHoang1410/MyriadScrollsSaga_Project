// client/src/shared/ui/ImagePlaceholder/index.tsx

import { Box, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Props cho component ImagePlaceholder.
 * Cho phép truyền sx để tùy biến style từ bên ngoài.
 */
interface ImagePlaceholderProps {
  sx?: SxProps<Theme>;
}

/**
 * Component dùng chung để hiển thị một khung giữ chỗ cho ảnh.
 * Rất hữu ích khi một đối tượng không có ảnh bìa.
 */
export const ImagePlaceholder = ({ sx }: ImagePlaceholderProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '200px', // Để nó tự co giãn theo container cha
      minHeight: 150, // Chiều cao tối thiểu
      backgroundColor: 'grey.200',
      borderRadius: 1,
      ...sx, // Áp dụng các style tùy chỉnh từ bên ngoài
    }}
  >
    <ImageIcon sx={{ fontSize: { xs: 40, md: 60 }, color: 'grey.500' }} />
    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
      No Image
    </Typography>
  </Box>
);