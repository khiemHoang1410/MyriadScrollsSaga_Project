// client/src/features/book/BookForm.tsx
import { useEffect } from 'react';
import { useForm, type SubmitHandler, Controller, type FieldError, type FieldErrorsImpl, type Merge } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, CircularProgress, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Autocomplete, FormHelperText } from '@mui/material';
import { Button as CustomButton } from '@/shared/ui/Button';

import { useCreateBook, useUpdateBook } from './';
import { type Book, type CreateBookInput, BookLayoutType } from './types'; // Import BookLayoutType
import type { Language } from '../language/types';
import type { Genre } from '../genres/types';
import type { Tag } from '../tag/types';
import { AVAILABLE_FONTS } from '@/shared/config/font';

// Zod Schema hoàn chỉnh
const bookFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  coverImageUrl: z.string().url({ message: 'URL ảnh bìa không hợp lệ' }).optional().or(z.literal('')),
  fontFamily: z.string().optional(),
  layoutType: z.nativeEnum(BookLayoutType).optional(),
  bookLanguage: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  genres: z.array(z.string()).min(1, 'Chọn ít nhất một thể loại'),
  tags: z.array(z.string()).optional(),
  startNodeId: z.string().min(1, 'Cần có ID của node bắt đầu').default('start'),

  storyNodes: z.string().transform((str, ctx) => {
    try {
      if (!str) return [];
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'JSON của Story Nodes không hợp lệ' });
      return z.NEVER;
    }
  }),
  storyVariables: z.string().transform((str, ctx) => {
    try {
      if (!str) return [];
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'JSON của Story Variables không hợp lệ' });
      return z.NEVER;
    }
  }),
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

  const {
    control, // Bắt buộc phải có control để dùng với Controller
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
      fontFamily: initialData?.fontFamily || '',
      layoutType: initialData?.layoutType || BookLayoutType.LITE_NOVEL,
      bookLanguage: initialData?.bookLanguage?._id || '',
      genres: initialData?.genres?.map(g => g._id) || [],
      tags: initialData?.tags?.map(t => t._id) || [],
      startNodeId: initialData?.startNodeId || 'start',
      // Chuyển object thành chuỗi JSON để hiển thị
      storyNodes: initialData ? JSON.stringify(initialData.storyNodes, null, 2) : '[]',
      storyVariables: initialData ? JSON.stringify(initialData.storyVariables, null, 2) : '[]',

    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        coverImageUrl: initialData.coverImageUrl || '',
        fontFamily: initialData.fontFamily || '',
        layoutType: initialData.layoutType || BookLayoutType.LITE_NOVEL,
        bookLanguage: initialData.bookLanguage._id,
        genres: initialData.genres.map(g => g._id),
        tags: initialData.tags.map(t => t._id),
        startNodeId: initialData.startNodeId || 'start',
        // Chuyển object thành chuỗi JSON khi reset form
        storyNodes: JSON.stringify(initialData.storyNodes, null, 2),
        storyVariables: JSON.stringify(initialData.storyVariables, null, 2),
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

  const getHelperText = (error: any): string | undefined => {
    if (!error) return undefined;
    if (typeof error.message === 'string') {
      return error.message;
    }
    return 'Invalid Input'; // Fallback nếu message không phải string
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, maxWidth: '800px' }}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{(error as any).message || 'Có lỗi xảy ra'}</Alert>}

        <TextField {...register('title')} label="Tiêu đề sách *" fullWidth error={!!errors.title} helperText={errors.title?.message} disabled={isPending} />
        <TextField {...register('coverImageUrl')} label="URL ảnh bìa" fullWidth error={!!errors.coverImageUrl} helperText={errors.coverImageUrl?.message} disabled={isPending} />
        <TextField {...register('description')} label="Mô tả" fullWidth multiline rows={4} error={!!errors.description} helperText={errors.description?.message} disabled={isPending} />
        <TextField
          {...register('storyNodes')}
          label="Nội dung truyện (JSON của Story Nodes)"
          fullWidth
          multiline
          rows={15}
          error={!!errors.storyNodes}
          helperText={getHelperText(errors.storyVariables)}
          disabled={isPending}
          placeholder='Dán mảng JSON của storyNodes vào đây'
          variant="filled"
        />

        <TextField
          {...register('storyVariables')}
          label="Biến của truyện (JSON của Story Variables)"
          fullWidth
          multiline
          rows={5}
          error={!!errors.storyVariables}
          helperText={getHelperText(errors.storyVariables)}
          placeholder='Dán mảng JSON của storyVariables vào đây'
          variant="filled"
        />
        <Controller
          name="fontFamily"
          control={control}
          defaultValue={initialData?.fontFamily || 'Public Sans'} // Set giá trị mặc định
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <InputLabel id="font-family-select-label">Font chữ cho truyện</InputLabel>
              <Select
                {...field}
                labelId="font-family-select-label"
                label="Font chữ cho truyện"
                disabled={isPending}
              >
                <MenuItem value="">
                  <em>Không chọn (Dùng font mặc định)</em>
                </MenuItem>
                {/* Lấy danh sách từ file config */}
                {AVAILABLE_FONTS.map((font) => (
                  <MenuItem key={font.value} value={font.value}>
                    {font.name}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error.message}</FormHelperText>}
            </FormControl>
          )}
        />


        <Controller
          name="layoutType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.layoutType}>
              <InputLabel id="layout-type-select-label">Loại giao diện</InputLabel>
              <Select {...field} labelId="layout-type-select-label" label="Loại giao diện" disabled={isPending}>
                <MenuItem value={BookLayoutType.LITE_NOVEL}>Tiểu Thuyết (Đơn giản, tập trung vào chữ)</MenuItem>
                <MenuItem value={BookLayoutType.ADVENTURE_LOG}>Phiêu Lưu (Có bảng trạng thái bên cạnh)</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="bookLanguage"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.bookLanguage}>
              <InputLabel id="language-select-label">Ngôn ngữ *</InputLabel>
              <Select {...field} labelId="language-select-label" label="Ngôn ngữ *" disabled={isPending}>
                {languages.map((lang) => (<MenuItem key={lang._id} value={lang._id}>{lang.name}</MenuItem>))}
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
              options={genres}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={field.value.map(id => genres.find(g => g._id === id)).filter(Boolean) as Genre[]}
              onChange={(_, newValue) => field.onChange(newValue.map(item => item._id))}
              renderInput={(params) => <TextField {...params} label="Thể loại *" error={!!errors.genres} helperText={errors.genres?.message} />}
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
              options={tags}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={(field.value || []).map(id => tags.find(t => t._id === id)).filter(Boolean) as Tag[]}
              onChange={(_, newValue) => field.onChange(newValue.map(item => item._id))}
              renderInput={(params) => <TextField {...params} label="Thẻ (Tags)" />}
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