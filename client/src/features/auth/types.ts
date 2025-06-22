// client/src/features/auth/types.ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  username: string;
  email: string;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

// Cấu trúc chuẩn mà API trả về
export interface AuthResponse {
  message: string;
  token: string;
  data: User; // User nằm trong key 'data'
}

// Input cho form đăng nhập
export interface LoginInput {
  email: string;
  password: string;
}

// Input cho form đăng ký
export interface RegisterInput extends LoginInput {
  username: string;
}