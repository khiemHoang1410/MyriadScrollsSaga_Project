// src/features/book/api.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Book } from './types';

export interface GetBooksResponse {
  data: Book[];
  // Có thể có thêm các trường meta (tổng số trang, etc.)
}

// Định nghĩa kiểu cho params
export interface GetBooksParams {
  status?: 'published' | 'draft' | 'in_review' | 'archived';
  // Thêm các param khác nếu cần: authorId, genreIds...
}

export const getBooks = async (params: GetBooksParams): Promise<GetBooksResponse> => {
  // Chúng ta sẽ tạo query string từ object params
  const { data } = await axiosInstance.get<GetBooksResponse>('/books', { params });
  return data;
};