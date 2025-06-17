// client/src/features/book/BookForm.tsx

import { useEffect } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert, Box, CircularProgress, Stack, TextField, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Autocomplete, Chip
} from '@mui/material';
import { Button as CustomButton } from '@/shared/ui/Button';

import { useCreateBook } from './useCreateBook';
import { useUpdateBook } from './useUpdateBook';
import type { Book, CreateBookInput } from './types';
import type { Language } from '../language/types';
import type { Genre } from '../genre/types';
import type { Tag } from '../tag/types';

// Zod Schema đã được nâng cấp
const bookFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  coverImageUrl: z.string().url('URL ảnh bìa không hợp lệ').optional().or(z.literal('')),
  bookLanguage: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  genres: z.array(z.string()).min(1, 'Chọn ít nhất một thể loại'),
  tags: z.array(z.string()).optional(),
  startNodeId: z.string().min(1, 'Cần có ID của node bắt đầu').default('start'),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  initialData?: Book;
  bookId?: string;
  languages?: Language[];
  genres?: Genre[];
  tags?: Tag[];
  isDataLoading?: boolean;
}

export const BookForm = ({ initialData, bookId, languages = [], genres = [], tags = [], isDataLoading }: BookFormProps) => {
  const isEditMode = !!initialData;

  const { mutate: createBook, isPending: isCreating, error: createError } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating, error: updateError } = useUpdateBook();

  const isPending = isCreating || isUpdating || isDataLoading;
  const error = createError || updateError;

  // FIX 1: Thêm `control` và `register` vào destructuring
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      coverImageUrl: initialData?.coverImageUrl || '',
      bookLanguage: initialData?.bookLanguage._id || '',
      genres: initialData?.genres.map(g => g._id) || [],
      tags: initialData?.tags.map(t => t._id) || [],
      startNodeId: initialData?.startNodeId || 'start',
    },
  });

  // FIX 2: useEffect cần reset TẤT CẢ các trường trong form
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        coverImageUrl: initialData.coverImageUrl || '',
        bookLanguage: initialData.bookLanguage._id,
        genres: initialData.genres.map(g => g._id),
        tags: initialData.tags.map(t => t._id),
        startNodeId: initialData?.startNodeId || 'start',
      });
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    if (isEditMode && bookId) {
      updateBook({ bookId, bookData: data });
    } else {
      createBook(data as CreateBookInput);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, maxWidth: '800px' }}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{(error as any).message || 'Có lỗi xảy ra'}</Alert>}

        <TextField {...register('title')} label="Tiêu đề sách *" fullWidth error={!!errors.title} helperText={errors.title?.message} disabled={isPending} />
        <TextField {...register('coverImageUrl')} label="URL ảnh bìa" fullWidth error={!!errors.coverImageUrl} helperText={errors.coverImageUrl?.message} disabled={isPending} />
        <TextField {...register('description')} label="Mô tả" fullWidth multiline rows={4} error={!!errors.description} helperText={errors.description?.message} disabled={isPending} />

        <Controller
          name="bookLanguage"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.bookLanguage}>
              <InputLabel id="language-select-label">Ngôn ngữ *</InputLabel>
              <Select {...field} labelId="language-select-label" label="Ngôn ngữ *" disabled={isPending}>
                {(languages || []).map((lang) => (<MenuItem key={lang._id} value={lang._id}>{lang.name}</MenuItem>))}
              </Select>
              {errors.bookLanguage && <FormHelperText>{errors.bookLanguage.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="genres"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={genres || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={field.value.map((id: string) => (genres || []).find(g => g._id === id)).filter(Boolean) as Genre[]}
              onChange={(_, newValue) => field.onChange(newValue.map(item => item._id))}
              renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option.name} {...getTagProps({ index })} />))}
              renderInput={(params) => (<TextField {...params} label="Thể loại *" error={!!errors.genres} helperText={errors.genres?.message} />)}
              disabled={isPending}
            />
          )}
        />

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={tags || []}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={(field.value || []).map((id: string) => (tags || []).find(t => t._id === id)).filter(Boolean) as Tag[]}
              onChange={(_, newValue) => field.onChange(newValue.map(item => item._id))}
              renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option.name} {...getTagProps({ index })} />))}
              renderInput={(params) => (<TextField {...params} label="Thẻ (Tags)" />)}
              disabled={isPending}
            />
          )}
        />

        <TextField {...register('startNodeId')} label="Start Node ID *" fullWidth required error={!!errors.startNodeId} helperText={errors.startNodeId?.message} disabled={isPending} />

        <CustomButton type="submit" variant="contained" size="large" disabled={isPending} sx={{ mt: 2 }} startIcon={isPending ? <CircularProgress size="1rem" color="inherit" /> : null}>
          {isPending ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sách' : 'Tạo sách mới')}
        </CustomButton>
      </Stack>
    </Box>
  );
};