// client/src/features/book/form-sections/BookForm_Taxonomy.tsx (Phiên bản đã sửa lỗi)

import { Autocomplete, TextField, Stack } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { type BookFormValues } from '../BookForm';
import type { Genre } from '../../genre/types';
import type { Tag } from '../../tag/types';

interface Props {
  isPending: boolean;
  genres: Genre[];
  tags: Tag[];
}

export const BookForm_Taxonomy = ({ isPending, genres, tags }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<BookFormValues>();

  return (
    <Stack spacing={3}>
      {/* Controller cho Thể loại (Genres) */}
      <Controller
        name="genres"
        control={control}
        render={({ field }) => {
          // Tìm các object Genre đầy đủ tương ứng với các ID trong form
          const selectedGenres = field.value
            .map(id => genres.find(g => g._id === id))
            .filter((g): g is Genre => !!g); // Dùng type guard để TypeScript tin tưởng

          return (
            <Autocomplete
              multiple
              options={genres}
              getOptionLabel={(option) => option.name}
              // Sửa lại isOptionEqualToValue cho an toàn tuyệt đối
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={selectedGenres} // <-- Dùng biến đã được filter ở trên
              onChange={(_, newValue) => {
                // Khi thay đổi, chỉ lưu lại mảng các ID
                const newIds = newValue.map(item => item._id);
                field.onChange(newIds);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Thể loại *"
                  error={!!errors.genres}
                  helperText={errors.genres?.message}
                />
              )}
              disabled={isPending}
            />
          );
        }}
      />

      {/* Controller cho Thẻ (Tags) - Sửa tương tự */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => {
          const selectedTags = (field.value || [])
            .map(id => tags.find(t => t._id === id))
            .filter((t): t is Tag => !!t);

          return (
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={selectedTags}
              onChange={(_, newValue) => {
                const newIds = newValue.map(item => item._id);
                field.onChange(newIds);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Thẻ (Tags)"
                  error={!!errors.tags}
                  helperText={errors.tags?.message}
                />
              )}
              disabled={isPending}
            />
          );
        }}
      />
    </Stack>
  );
}; 