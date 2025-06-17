import { axiosInstance } from '@/shared/api/axiosInstance';
import type { LoginUserInput,RegisterUserInput,User } from './types'; 
// Định nghĩa kiểu dữ liệu trả về từ API login

// --- Login ---
export interface LoginResponse {
  token: string;
  data: User;
}

export const login = async (credentials: LoginUserInput): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
  return data;
};


// --- Register ---
export interface RegisterResponse {
  message: string;
  data: User;
}

export const register = async (userData: RegisterUserInput): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post<RegisterResponse>('/auth/register', userData);
  return data;
};