// client/src/features/play/components/PlayerStatsPane.tsx

import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import type { Book } from '@/features/book';
import StarIcon from '@mui/icons-material/Star';
import KeyIcon from '@mui/icons-material/Key';
import ShieldIcon from '@mui/icons-material/Shield';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// Props giờ sẽ nhận cả object book
interface PlayerStatsPaneProps {
  book: Book;
  variablesState: Record<string, any>;
}

// Helper nhỏ để chọn icon cho 'chất'
const getVariableIcon = (variableName: string) => {
  if (variableName.includes('gold')) return <MonetizationOnIcon color="warning" />;
  if (variableName.includes('exp')) return <StarIcon sx={{ color: '#fbc02d' }} />;
  if (variableName.includes('key')) return <KeyIcon color="action" />;
  if (variableName.includes('trust')) return <ShieldIcon color="success" />;
  return <HelpOutlineIcon color="disabled" />;
};

export const PlayerStatsPane = ({ book, variablesState }: PlayerStatsPaneProps) => {
  // Lọc ra những variable được phép hiển thị
  const visibleVariables = book.storyVariables?.filter(
    (varDef) => varDef.scope === 'player_visible'
  ) || [];

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', backgroundColor: '#fdf5e6', border: '1px solid #e0dacc' }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: 'Lobster', textAlign: 'center' }}>
        Nhật Ký
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Nếu không có variable nào để hiển thị */}
      {visibleVariables.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Chưa có thông tin gì đặc biệt.
        </Typography>
      ) : (
        <List dense>
          {/* Map qua danh sách variable được hiển thị */}
          {visibleVariables.map((varDef) => {
            const currentValue = variablesState[varDef.name];

            // Nếu là boolean và đang là true, thì hiển thị như một vật phẩm
            if (varDef.type === 'boolean' && currentValue === true) {
              return (
                <ListItem key={varDef.name}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getVariableIcon(varDef.name)}
                  </ListItemIcon>
                  {/* Dùng description làm tên cho hay */}
                  <ListItemText primary={varDef.description || varDef.name} />
                </ListItem>
              );
            }

            // Nếu là number, hiển thị giá trị
            if (varDef.type === 'number') {
              return (
                <ListItem key={varDef.name}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getVariableIcon(varDef.name)}
                  </ListItemIcon>
                  <ListItemText primary={varDef.description || varDef.name} />
                  <Chip label={currentValue ?? 0} size="small" />
                </ListItem>
              );
            }

            // Mặc định không hiển thị các kiểu khác (boolean false, string...)
            return null;
          })}
        </List>
      )}
    </Paper>
  );
};