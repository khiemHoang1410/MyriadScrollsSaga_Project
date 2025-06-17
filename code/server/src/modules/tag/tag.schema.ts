// server/src/modules/tag/tag.schema.ts
import { z } from 'zod';
import { generateSlug } from '@/utils/slugify.util';

const SLUG_VALIDATION_MESSAGE_TAG =
  'Tag name must be able to form a valid slug (e.g., contain letters or numbers). It cannot consist only of special characters that are removed during slug generation.';

export const createTagSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Tag name is required.',
      })
      .trim()
      .min(1, 'Tag name cannot be empty.')
      .max(100, 'Tag name cannot exceed 100 characters.')
      .refine((val) => generateSlug(val).length > 0, {
        message: SLUG_VALIDATION_MESSAGE_TAG,
      }),
    description: z
      .string()
      .trim()
      .max(500, 'Tag description cannot exceed 500 characters.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(), // << THÊM isActive (optional khi tạo)
  }),
});

export type CreateTagInput = z.infer<typeof createTagSchema>['body'];

export const updateTagSchema = z.object({
  params: z.object({
    tagId: z.string({ required_error: 'Tag ID in params is required.' }),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Tag name cannot be empty.')
      .max(100, 'Tag name cannot exceed 100 characters.')
      .refine((val) => generateSlug(val).length > 0, {
        message: SLUG_VALIDATION_MESSAGE_TAG,
      })
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Tag description cannot exceed 500 characters.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(), // << THÊM isActive (optional khi cập nhật)
  }),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>['body'];
export type UpdateTagParams = z.infer<typeof updateTagSchema>['params'];

export const tagIdParamsSchema = z.object({
  params: z.object({
    tagId: z.string({ required_error: 'Tag ID in params is required.' }),
  }),
});
export type TagIdParams = z.infer<typeof tagIdParamsSchema>['params'];