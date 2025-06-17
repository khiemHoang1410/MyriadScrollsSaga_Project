// server/src/modules/genre/genre.schema.ts -- ĐẢM BẢO CHUẨN CHỈNH
import { z } from 'zod';
import { generateSlug } from '@/utils/slugify.util';

const SLUG_VALIDATION_MESSAGE_GENRE = 
  'Genre name must be able to form a valid slug (e.g., contain letters or numbers). It cannot consist only of special characters that are removed during slug generation.';

export const createGenreSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Genre name is required.',
      })
      .trim()
      .min(1, 'Genre name cannot be empty.')
      .max(100, 'Genre name cannot exceed 100 characters.')
      .refine((val) => generateSlug(val).length > 0, { 
        message: SLUG_VALIDATION_MESSAGE_GENRE,
      }),
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(), // Admin có thể set khi tạo
  }),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>['body'];

export const updateGenreSchema = z.object({
  params: z.object({
    genreId: z.string({ required_error: 'Genre ID in params is required.' }),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Genre name cannot be empty.')
      .max(100, 'Genre name cannot exceed 100 characters.')
      .refine((val) => generateSlug(val).length > 0, { // << Đảm bảo có refine này
        message: SLUG_VALIDATION_MESSAGE_GENRE,
      })
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(), // Admin có thể cập nhật
  }),
});

export type UpdateGenreInput = z.infer<typeof updateGenreSchema>['body'];
export type UpdateGenreParams = z.infer<typeof updateGenreSchema>['params'];

export const genreIdParamsSchema = z.object({
  params: z.object({
    genreId: z.string({ required_error: 'Genre ID in params is required.' }),
  }),
});
export type GenreIdParams = z.infer<typeof genreIdParamsSchema>['params'];