// client/src/features/auth/api.auth.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { LoginInput, RegisterInput, AuthResponse } from './types';

// Hàm login giờ sẽ trả về đúng kiểu AuthResponse
export const login = async (credentials: LoginInput): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return data;
};

// Tương tự cho hàm register
export const register = async (userData: RegisterInput): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/register', userData);
  return data;
};