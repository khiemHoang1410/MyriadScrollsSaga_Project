import { axiosInstance } from '@/shared/api/axiosInstance';
import type { LoginUserInput } from './types'; 
// Định nghĩa kiểu dữ liệu trả về từ API login
export interface LoginResponse {
  token: string;
  data: {
    _id: string;
    username: string;
    email: string; 
    roles: string[];
  };
}

export const login = async (credentials: LoginUserInput): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
  return data;
};