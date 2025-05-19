// server/src/modules/genre/genre.schema.ts
import { z } from 'zod';

// Schema cho việc tạo một Genre mới
export const createGenreSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Genre name is required.',
      })
      .trim()
      .min(1, 'Genre name cannot be empty.')
      .max(100, 'Genre name cannot exceed 100 characters.'),
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional(), // description là tùy chọn
    // slug sẽ được tự động tạo từ name (ở model hook hoặc service), nên không cần client gửi lên
    // isActive có thể có default là true trong model, hoặc admin có thể set lúc tạo
    isActive: z.boolean().optional(),
  }),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>['body'];

// Schema cho việc cập nhật Genre (tương tự nhưng các trường đều optional)
export const updateGenreSchema = z.object({
  params: z.object({
    genreId: z.string({ required_error: 'Genre ID in params is required.' }), // Hoặc kiểm tra ObjectId nếu bro muốn chặt chẽ hơn
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Genre name cannot be empty.')
      .max(100, 'Genre name cannot exceed 100 characters.')
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Genre description cannot exceed 500 characters.')
      .optional()
      .nullable(), // Cho phép gửi null để xóa description
    isActive: z.boolean().optional(),
    // slug có thể được tự động cập nhật nếu name thay đổi, xử lý ở service/model
  }),
});

export type UpdateGenreInput = z.infer<typeof updateGenreSchema>['body'];
export type UpdateGenreParams = z.infer<typeof updateGenreSchema>['params'];


// Schema cho params khi cần genreId (ví dụ: getGenreById, deleteGenre)
export const genreIdParamsSchema = z.object({
  params: z.object({
    genreId: z.string({ required_error: 'Genre ID in params is required.' }),
  }),
});
export type GenreIdParams = z.infer<typeof genreIdParamsSchema>['params'];