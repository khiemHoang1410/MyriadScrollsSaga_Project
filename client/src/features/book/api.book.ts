// src/features/book/api.book.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Book } from './types';

// --- Phần đã có ---
export interface GetBooksResponse {
  data: Book[];
}
export interface GetBooksParams {
  status?: 'published' | 'draft' | 'in_review' | 'archived';
}
export const getBooks = async (params: GetBooksParams): Promise<GetBooksResponse> => {
  const { data } = await axiosInstance.get<GetBooksResponse>('/books', { params });
  return data;
};

// --- Phần mới đã thêm ---
export interface GetBookByIdResponse {
  data: Book;
}

export const getBookById = async (identifier: string): Promise<GetBookByIdResponse> => {
  const { data } = await axiosInstance.get<GetBookByIdResponse>(`/books/${identifier}`);
  return data;
};