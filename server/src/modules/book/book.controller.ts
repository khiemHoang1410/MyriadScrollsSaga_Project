// src/modules/book/book.controller.ts
import { Response, Request } from 'express'; // Import Request gốc từ Express
import * as bookService from './book.service';
import {
  CreateBookInput,
  UpdateBookInput,
  UpdateBookParams,
  BookIdParams,
  GetAllBooksQueryInput,
  // Các schema cho PageNode, Choice nếu bro làm API riêng cho chúng
  // PageNodeInput,
  // PageNodeIdParams,
  // ChoiceInput,
  // ChoiceIdParams,
} from './book.schema';
import { HttpStatus, GeneralMessages, AuthenticatedRequest, UserRole } from '@/types';

// Kiểu helper để kết hợp AuthenticatedRequest với các kiểu generic của Express Request
type AuthRequestWithParams<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = AuthenticatedRequest & Request<P, ResBody, ReqBody, ReqQuery>;

export const createBookHandler = async (
  req: AuthRequestWithParams<{}, {}, CreateBookInput>,
  res: Response
): Promise<void> => {
  const authorId = req.user?.userId;
  if (!authorId) {
    // Middleware authenticateToken nên đã xử lý trường hợp này, nhưng kiểm tra lại cho chắc
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated for creating a book.' });
    return;
  }
  const newBook = await bookService.createBook(req.body, authorId);
  res.status(HttpStatus.CREATED).json({
    message: 'Book created successfully!',
    data: newBook,
  });
};

export const getAllBooksHandler = async (
  req: AuthRequestWithParams<{}, {}, {}, GetAllBooksQueryInput>,
  res: Response
): Promise<void> => {
  const currentUserId = req.user?.userId; // Có thể null nếu route này public và user chưa đăng nhập
  const currentUserRoles = req.user?.roles; // Tương tự

  const result = await bookService.getAllBooks(req.query, currentUserId, currentUserRoles);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: result.books,
    meta: {
        totalBooks: result.totalBooks,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: req.query.limit || 10, // Lấy limit từ query hoặc default trong service
    }
  });
};

export const getBookByIdHandler = async (
  req: AuthRequestWithParams<BookIdParams, {}, {}, {}>,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;
  const currentUserId = req.user?.userId;
  const currentUserRoles = req.user?.roles;

  const book = await bookService.getBookById(bookId, currentUserId, currentUserRoles);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: book,
  });
};

export const updateBookByIdHandler = async (
  req: AuthRequestWithParams<UpdateBookParams, {}, UpdateBookInput>,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;
  const currentUserId = req.user?.userId;
  const currentUserRoles = req.user?.roles;

  if (!currentUserId || !currentUserRoles) {
    // Cần user đã xác thực để thực hiện update
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User authentication details are missing for update.' });
    return;
  }

  const updatedBook = await bookService.updateBookById(bookId, currentUserId, currentUserRoles, req.body);
  res.status(HttpStatus.OK).json({
    message: 'Book updated successfully!',
    data: updatedBook,
  });
};

export const deleteBookByIdHandler = async (
  req: AuthRequestWithParams<BookIdParams>,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;
  const currentUserId = req.user?.userId;
  const currentUserRoles = req.user?.roles;

  if (!currentUserId || !currentUserRoles) {
    // Cần user đã xác thực để thực hiện delete
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User authentication details are missing for delete.' });
      return;
  }

  await bookService.deleteBookById(bookId, currentUserId, currentUserRoles);
  res.status(HttpStatus.OK).json({
    message: 'Book deleted successfully!', // Hoặc HttpStatus.NO_CONTENT (204) và không có body
  });
};

// --- (Tùy chọn) Controller Handlers cho quản lý PageNode, Choice riêng lẻ ---
// Ví dụ:
// export const addPageNodeHandler = async (
//   req: AuthRequestWithParams<{ bookId: string }, {}, PageNodeInput>, // PageNodeInput cần được định nghĩa trong book.schema.ts
//   res: Response
// ): Promise<void> => {
//   const { bookId } = req.params;
//   const currentUserId = req.user?.userId;
//   const currentUserRoles = req.user?.roles;
//   if (!currentUserId || !currentUserRoles) {
//     res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated.' });
//     return;
//   }
//   // Gọi service tương ứng, ví dụ:
//   // const newNode = await bookService.addPageNodeToBook(bookId, currentUserId, currentUserRoles, req.body);
//   // res.status(HttpStatus.CREATED).json({ message: 'Page node added successfully!', data: newNode });
// };

// Tương tự cho updatePageNodeHandler, removePageNodeHandler, và các handler cho Choices