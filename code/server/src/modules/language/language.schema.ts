// server/src/modules/language/language.schema.ts
import { z } from 'zod';

// Các trường chung cho Language, có thể dùng lại nếu muốn
const languageBaseSchema = {
  name: z
    .string({
      required_error: 'Language name is required.',
    })
    .trim()
    .min(1, 'Language name cannot be empty.')
    .max(100, 'Language name cannot exceed 100 characters.'),
  code: z
    .string({
      required_error: 'Language code is required.',
    })
    .trim()
    .toLowerCase() // Mã ngôn ngữ thường là chữ thường
    .min(2, 'Language code should be at least 2 characters (e.g., "en", "vi").')
    .max(10, 'Language code cannot exceed 10 characters (e.g., "en-US").')
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2,3})?$/, 'Invalid language code format (e.g., "en", "en-us", "vie").'), // Regex cơ bản cho mã ISO 639
  nativeName: z
    .string()
    .trim()
    .max(100, 'Native language name cannot exceed 100 characters.')
    .optional()
    .nullable(),
  flagIconUrl: z
    .string()
    .url({ message: 'Invalid URL format for flag icon.' }) // Validate URL
    .optional()
    .nullable(),
  isActive: z.boolean().optional(), // Mặc định sẽ là true trong model nếu không gửi
};

// Schema cho việc tạo một Language mới
export const createLanguageSchema = z.object({
  body: z.object({
    ...languageBaseSchema,
    // Khi tạo, name và code là bắt buộc (đã định nghĩa trong base)
  }),
});

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>['body'];

// Schema cho việc cập nhật Language
// Khi cập nhật, tất cả các trường đều là optional
export const updateLanguageSchema = z.object({
  params: z.object({
    languageId: z.string({ required_error: 'Language ID in params is required.' }),
  }),
  body: z.object({
    name: languageBaseSchema.name.optional(),
    code: languageBaseSchema.code.optional(), // Cẩn thận khi cho phép cập nhật 'code' vì nó là unique và là key chính
    nativeName: languageBaseSchema.nativeName,
    flagIconUrl: languageBaseSchema.flagIconUrl,
    isActive: languageBaseSchema.isActive,
  }).refine(data => Object.keys(data).length > 0, { // Đảm bảo body không rỗng khi update
    message: "Request body for update cannot be empty. At least one field to update must be provided.",
    path: ["body"], // Gán lỗi cho toàn bộ body nếu nó rỗng
  }),
});

export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>['body'];
export type UpdateLanguageParams = z.infer<typeof updateLanguageSchema>['params'];

// Schema cho params khi cần languageId (ví dụ: getById, deleteById)
export const languageIdParamsSchema = z.object({
  params: z.object({
    languageId: z.string({ required_error: 'Language ID in params is required.' }),
  }),
});
export type LanguageIdParams = z.infer<typeof languageIdParamsSchema>['params'];