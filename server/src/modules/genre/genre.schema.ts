// server/src/modules/genre/genre.schema.ts
import { z } from 'zod';
import { generateSlug } from '@/utils/slugify.util'; // Đảm bảo bro đã tạo file này và export generateSlug

const SLUG_VALIDATION_MESSAGE =
  'Genre name must be able to form a valid slug (e.g., contain letters or numbers). It cannot consist only of special characters that are removed during slug generation.';

// Schema cho việc tạo một Genre mới
export const createGenreSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Genre name is required.',
      })
      .trim()
      .min(1, 'Genre name cannot be empty.')
      .max(100, 'Genre name cannot exceed 100 characters.')
      .refine((val) => generateSlug(val).length > 0, { // << SỬ DỤNG REFINE VỚI generateSlug
        message: SLUG_VALIDATION_MESSAGE,
      }),
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional()
      .nullable(), // << Giữ lại .nullable() nếu bro muốn cho phép client gửi null
                   // Nếu chỉ .optional() thì là string | undefined
                   // Nếu .optional().nullable() thì là string | null | undefined
    isActive: z.boolean().optional(), // Mặc định sẽ là true trong model nếu không gửi
  }),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>['body'];

// Schema cho việc cập nhật Genre
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
      .refine((val) => generateSlug(val).length > 0, { // << SỬ DỤNG REFINE VỚI generateSlug
        message: SLUG_VALIDATION_MESSAGE,
      })
      .optional(), // name là optional khi update, nhưng nếu có thì phải hợp lệ
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateGenreInput = z.infer<typeof updateGenreSchema>['body'];
export type UpdateGenreParams = z.infer<typeof updateGenreSchema>['params'];

// Schema cho params khi cần genreId
export const genreIdParamsSchema = z.object({
  params: z.object({
    genreId: z.string({ required_error: 'Genre ID in params is required.' }),
  }),
});
export type GenreIdParams = z.infer<typeof genreIdParamsSchema>['params'];