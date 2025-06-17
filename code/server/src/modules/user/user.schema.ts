// src/modules/user/user.schema.ts
import { z } from 'zod';
import { UserRole } from './user.model'; // Import từ model cùng module

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long.')
  .max(100, 'Password cannot exceed 100 characters.');

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username is required.' })
      .trim()
      .min(3, 'Username must be at least 3 characters long.')
      .max(50, 'Username cannot exceed 50 characters.'),
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .email('Invalid email address.')
      .max(100, 'Email cannot exceed 100 characters.'),
    password: passwordSchema.optional(), // Admin có thể đặt pass khi tạo, hoặc để user tự đặt sau
    roles: z.array(z.nativeEnum(UserRole)).optional().default([UserRole.USER]),
  }),
});
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string({ required_error: 'User ID in params is required.' }),
  }),
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long.')
      .max(50, 'Username cannot exceed 50 characters.')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Invalid email address.')
      .max(100, 'Email cannot exceed 100 characters.')
      .optional(),
    // Không cho phép cập nhật password trực tiếp qua route này để đơn giản
    // password: passwordSchema.optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "Request body for update cannot be empty.",
    path: ["body"],
  }),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserParams = z.infer<typeof updateUserSchema>['params'];

export const userIdParamsSchema = z.object({
  params: z.object({
    userId: z.string({ required_error: 'User ID in params is required.' }),
  }),
});
export type UserIdParams = z.infer<typeof userIdParamsSchema>['params'];