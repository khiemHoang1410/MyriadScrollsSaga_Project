// src/features/auth/types.ts

export interface LoginUserInput {
  email: string;
  password: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}