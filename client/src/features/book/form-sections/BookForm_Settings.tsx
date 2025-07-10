// client/src/features/book/form-sections/BookForm_Settings.tsx

import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Stack } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { BookLayoutType } from '../types';
import { type BookFormValues } from '../BookForm';
import type { Language } from '../../language/types';
import { AVAILABLE_FONTS } from '@/shared/config/font';

interface Props {
  isPending: boolean;
  languages: Language[]; // Nhận danh sách ngôn ngữ từ form cha
}

export const BookForm_Settings = ({ isPending, languages }: Props) => {
  // "Bắt sóng wifi" từ FormProvider
  const { control, formState: { errors } } = useFormContext<BookFormValues>();

  return (
    <Stack spacing={3}>
      {/* Controller cho Font chữ */}
      <Controller
        name="fontFamily"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.fontFamily}>
            <InputLabel id="font-family-select-label">Font chữ</InputLabel>
            <Select
              {...field}
              labelId="font-family-select-label"
              label="Font chữ"
              disabled={isPending}
            >
              <MenuItem value="">
                <em>Mặc định</em>
              </MenuItem>
              {AVAILABLE_FONTS.map((font) => (
                <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
                  {font.name}
                </MenuItem>
              ))}
            </Select>
            {errors.fontFamily && <FormHelperText>{errors.fontFamily.message}</FormHelperText>}
          </FormControl>
        )}
      />

      {/* Controller cho Loại giao diện */}
      <Controller
        name="layoutType"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.layoutType}>
            <InputLabel id="layout-type-select-label">Loại giao diện</InputLabel>
            <Select
                {...field}
                labelId="layout-type-select-label"
                label="Loại giao diện"
                disabled={isPending}
            >
              <MenuItem value={BookLayoutType.LITE_NOVEL}>Tiểu Thuyết (Tập trung vào chữ)</MenuItem>
              <MenuItem value={BookLayoutType.ADVENTURE_LOG}>Phiêu Lưu (Có bảng trạng thái)</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      {/* Controller cho Ngôn ngữ */}
      <Controller
        name="bookLanguage"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.bookLanguage}>
            <InputLabel id="language-select-label">Ngôn ngữ *</InputLabel>
            <Select
                {...field}
                labelId="language-select-label"
                label="Ngôn ngữ *"
                disabled={isPending}
            >
              {languages.map((lang) => (
                <MenuItem key={lang._id} value={lang._id}>{lang.name}</MenuItem>
              ))}
            </Select>
            {errors.bookLanguage && <FormHelperText>{errors.bookLanguage.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </Stack>
  );
};