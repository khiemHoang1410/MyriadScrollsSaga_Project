// client/src/features/book/api.book.ts

import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Book, CreateBookInput, GetBooksParams, UpdateBookInput } from './types';

// =================================================================
// ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU TRẢ VỀ CỦA API
// =================================================================

/** Kiểu dữ liệu trả về cho API lấy danh sách sách */
export interface GetBooksResponse {
  data: Book[];
  meta?: {
    totalBooks: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

/** Kiểu dữ liệu trả về cho API lấy một sách */
export interface GetBookResponse {
  data: Book;
}

/** Kiểu dữ liệu trả về cho API tạo/sửa sách */
export interface MutateBookResponse {
  message: string;
  data: Book;
}

// =================================================================
// CÁC HÀM GỌI API
// =================================================================

/**
 * Fetches a list of books from the API.
 * @param {GetBooksParams} params - The query parameters for filtering books (e.g., status).
 * @returns {Promise<GetBooksResponse>} The response containing the list of books and metadata.
 */
export const getBooks = async (params: GetBooksParams): Promise<GetBooksResponse> => {
  const { data } = await axiosInstance.get<GetBooksResponse>('/books', { params });
  return data;
};

/**
 * Fetches a single book by its identifier (slug or ID).
 * @param {string} identifier - The book's slug or ID.
 * @returns {Promise<GetBookResponse>} The response containing the book data.
 */
export const getBook = async (identifier: string): Promise<GetBookResponse> => {
  const { data } = await axiosInstance.get<GetBookResponse>(`/books/${identifier}`);
  return data;
};

/**
 * Creates a new book.
 * @param {CreateBookInput} bookData - The data for the new book.
 * @returns {Promise<Book>} The newly created book data.
 */
export const createBook = async (bookData: CreateBookInput): Promise<Book> => {
  const { data } = await axiosInstance.post<MutateBookResponse>('/books', bookData);
  return data.data; // Backend trả về { message, data }, ta chỉ cần lấy data
};

/**
 * Updates an existing book.
 * @param {object} payload - The payload containing the bookId and the update data.
 * @param {string} payload.bookId - The ID of the book to update.
 * @param {UpdateBookInput} payload.bookData - The new data for the book.
 * @returns {Promise<Book>} The updated book data.
 */
export const updateBook = async ({ bookId, bookData }: { bookId: string; bookData: UpdateBookInput }): Promise<Book> => {
  const { data } = await axiosInstance.put<MutateBookResponse>(`/books/${bookId}`, bookData);
  return data.data; // Backend trả về { message, data }, ta chỉ cần lấy data
};

export const deleteBook = async (bookId: string): Promise<void> => {
  await axiosInstance.delete(`/books/${bookId}`);
};