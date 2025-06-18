// src/modules/book/book.controller.ts
import { Response, Request } from 'express';
import * as bookService from './book.service';
import {
  CreateBookInput,
  UpdateBookInput,
  UpdateBookParams,
  BookIdParams,
  GetAllBooksQueryInput,
  PlayChoiceParams,
  BookSlugParams,
  // Các schema cho PageNode, Choice nếu làm API riêng
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
  const currentUserId = req.user?.userId; 
  const currentUserRoles = req.user?.roles; // Tương tự
  
  const queryParams = req.validatedQuery || req.query;

  const result = await bookService.getAllBooks(queryParams as GetAllBooksQueryInput, currentUserId, currentUserRoles);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: result.books,
    meta: {
        totalBooks: result.totalBooks,
        totalPages: result.totalPages,
        currentPage: (queryParams as GetAllBooksQueryInput).page || 1, // Lấy từ queryParams đã validate
        limit: (queryParams as GetAllBooksQueryInput).limit || 10,    // Lấy từ queryParams đã validate
    }
  });
};

export const getBookByIdHandler = async (
  req: AuthRequestWithParams<BookSlugParams, {}, {}, {}>, // Dùng type cho slug
  res: Response
): Promise<void> => {
  // 1. Lấy ra "slug" từ params, không phải "bookId"
  const { slug } = req.params;
  const currentUserId = req.user?.userId;
  const currentUserRoles = req.user?.roles;

  // 2. Gọi hàm service "getBook" (hàm mới) và truyền "slug" vào
  const book = await bookService.getBook(slug, currentUserId, currentUserRoles);
  
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

//TODO-- (Tùy chọn) Controller Handlers cho quản lý PageNode, Choice riêng lẻ ---


// THÊM CONTROLLER HANDLER MỚI
export const playBookHandler = async (
  req: AuthRequestWithParams<BookIdParams>, // BookIdParams là type cho req.params
  res: Response
): Promise<void> => {
  // Lấy slug  từ params đã được validate
  // Nếu bro đã sửa validateResource để dùng req.validatedParams thì dùng nó
  const { slug  } = (req as any).validatedParams || req.params; 
  
  const userId = req.user!.userId; // Đã qua authenticateToken nên req.user phải có
  const userRoles = req.user!.roles;

  // Gọi service function tương ứng
  const playState = await bookService.startOrGetPlayState(slug , userId, userRoles);

  res.status(HttpStatus.OK).json({
    message: 'Successfully started or retrieved play state.',
    data: playState,
  });
};


export const makeChoiceHandler = async (
  req: AuthRequestWithParams<PlayChoiceParams>, // Sử dụng PlayChoiceParams
  res: Response
): Promise<void> => {
  // const { slug, nodeId, choiceId } = req.params; // Nếu không dùng validatedParams
  const { slug, nodeId, choiceId } = (req as any).validatedParams || req.params;
  
  const userId = req.user!.userId;
  const userRoles = req.user!.roles; // Có thể cần nếu admin có quyền đặc biệt khi chơi

  const nextPlayState = await bookService.processPlayerChoice(
    slug,
    userId,
    nodeId, // nodeId của node hiện tại (nơi user chọn choice)
    choiceId,
    userRoles
  );

  res.status(HttpStatus.OK).json({
    message: 'Choice processed successfully.',
    data: nextPlayState, // Trả về IPlayStateOutput tương tự như API /play
  });
};
// Tương tự cho updatePageNodeHandler, removePageNodeHandler, và các handler cho Choices