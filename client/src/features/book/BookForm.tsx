// client/src/features/book/BookForm.tsx (Phiên bản đã được tái cấu trúc)

import { useEffect } from 'react';
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, CircularProgress, Stack, Grid, Paper, Typography } from '@mui/material';
import { Button as CustomButton } from '@/shared/ui/Button';

import { useCreateBook, useUpdateBook } from './';
import { type Book, type CreateBookInput, BookLayoutType } from './types';
import type { Language } from '../language/types';
import type { Genre } from '../genre/types';
import type { Tag } from '../tag/types';

// --- Import các Section con mà mình SẼ tạo ở các bước tiếp theo ---
// (Lát nữa mình tạo file thì nó sẽ hết báo lỗi)
import { BookForm_BasicInfo } from './form-sections/BookForm_BasicInfo';
import { BookForm_Taxonomy } from './form-sections/BookForm_Taxonomy';
import { BookForm_ContentJson } from './form-sections/BookForm_ContentJson';
import { BookForm_Settings } from './form-sections/BookForm_Settings';


// Zod Schema vẫn giữ nguyên, nó là "bản thiết kế" dữ liệu của mình.
const bookFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  coverImageUrl: z.string().url({ message: 'URL ảnh bìa không hợp lệ' }).optional().or(z.literal('')),
  fontFamily: z.string().optional(),
  layoutType: z.nativeEnum(BookLayoutType), // Bỏ optional() để bắt buộc chọn
  bookLanguage: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  genres: z.array(z.string()).min(1, 'Chọn ít nhất một thể loại'),
  tags: z.array(z.string()).optional(),
  startNodeId: z.string().min(1, 'Cần có ID của node bắt đầu').default('start'),
  storyNodes: z.string().transform((str, ctx) => {
    try {
      if (!str.trim()) return [];
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'JSON của Story Nodes không hợp lệ' });
      return z.NEVER;
    }
  }),
  storyVariables: z.string().transform((str, ctx) => {
    try {
      if (!str.trim()) return [];
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'JSON của Story Variables không hợp lệ' });
      return z.NEVER;
    }
  }),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

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

  const isPending = !!(isCreating || isUpdating || isDataLoading);
  const error = createError || updateError;

  // Khởi tạo form và lấy ra tất cả các "đồ nghề"
  const methods = useForm<BookFormValues>({
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
      storyNodes: initialData ? JSON.stringify(initialData.storyNodes, null, 2) : '[]',
      storyVariables: initialData ? JSON.stringify(initialData.storyVariables, null, 2) : '[]',
    },
  });

  useEffect(() => {
    if (initialData) {
      // Dùng reset từ methods
      methods.reset({
        title: initialData.title,
        description: initialData.description || '',
        coverImageUrl: initialData.coverImageUrl || '',
        fontFamily: initialData.fontFamily || '',
        layoutType: initialData.layoutType,
        bookLanguage: initialData.bookLanguage._id,
        genres: initialData.genres.map(g => g._id),
        tags: initialData.tags.map(t => t._id),
        startNodeId: initialData.startNodeId,
        storyNodes: JSON.stringify(initialData.storyNodes, null, 2),
        storyVariables: JSON.stringify(initialData.storyVariables, null, 2),
      });
    }
  }, [initialData, methods.reset]);

  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    if (isEditMode && bookId) {
      updateBook({ bookId, bookData: data });
    } else {
      createBook(data as CreateBookInput);
    }
  };

  return (
    // <FormProvider> là "trùm cuối", nó sẽ phát "sóng wifi" chứa context của form
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} sx={{ mt: 3 }}>
        <Grid container spacing={4}>
          {/* Cột chính bên trái */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{(error as any).message || 'Có lỗi xảy ra'}</Alert>}

              {/* Thay thế một đống TextField bằng một component section duy nhất */}
              <BookForm_BasicInfo isPending={isPending} />

              {/* Tương tự cho phần nội dung JSON */}
              <BookForm_ContentJson isPending={isPending} />
            </Stack>
          </Grid>

          {/* Cột phụ bên phải, sẽ dính lại khi cuộn */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, position: 'sticky', top: '80px' }}>
              <Stack spacing={3}>
                <Typography variant="h6">Cài đặt & Phân loại</Typography>

                {/* Thay thế các Select, Autocomplete bằng các section con */}
                <BookForm_Settings isPending={isPending} languages={languages} />
                <BookForm_Taxonomy isPending={isPending} genres={genres} tags={tags} />

                <CustomButton type="submit" variant="contained" size="large" fullWidth disabled={isPending} startIcon={isPending ? <CircularProgress size="1rem" color="inherit" /> : null}>
                  {isPending ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sách' : 'Tạo sách mới')}
                </CustomButton>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};