// src/modules/auth/auth.schema.ts
import { z } from 'zod';
import { UserRole } from '@/modules/user/user.model'; // Sẽ import từ user module

export const registerUserSchema = z.object({
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
    password: z
      .string({ required_error: 'Password is required.' })
      .min(6, 'Password must be at least 6 characters long.')
      .max(100, 'Password cannot exceed 100 characters.'),
    roles: z.array(z.nativeEnum(UserRole)).optional(), // Optional, default sẽ là USER trong service/model
  }),
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .email('Invalid email address.'),
    password: z.string({ required_error: 'Password is required.' }),
  }),
});
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];

// Schema cho /me route, không cần input body, chỉ cần token
// export const getMeSchema = z.object({}); // Không thực sự cần thiết nếu không có params/query/body