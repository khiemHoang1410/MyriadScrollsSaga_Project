// src/modules/book/book.route.ts
import express from 'express';
import { asyncHandler } from '@/utils';
import { validateResource, authenticateToken, authorizeRoles,optionalAuthenticateToken  } from '@/middleware'; // Đảm bảo authorizeRoles được import
import * as bookController from './book.controller';
import {
  createBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
  getAllBooksSchema,
  playChoiceParamsSchema,
  bookSlugParamsSchema,
} from './book.schema';
import { UserRole } from '@/modules/user/user.model'; // Đảm bảo UserRole được import

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(createBookSchema),
  asyncHandler(bookController.createBookHandler)
);

router.get(
  '/',
  optionalAuthenticateToken, // Sử dụng middleware mới
  validateResource(getAllBooksSchema),
  asyncHandler(bookController.getAllBooksHandler)
);

router.get(
  '/:slug',
  optionalAuthenticateToken, // Cũng nên thêm vào đây để service có thể check quyền
  validateResource(bookSlugParamsSchema), 
  asyncHandler(bookController.getBookByIdHandler)
);
router.put(
  '/:bookId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(updateBookSchema),
  asyncHandler(bookController.updateBookByIdHandler)
);

router.delete(
  '/:bookId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(bookIdParamsSchema),
  asyncHandler(bookController.deleteBookByIdHandler)
);


router.get(
  '/:bookId/play', // Endpoint để bắt đầu hoặc tiếp tục chơi sách
  authenticateToken, // Cần biết user nào đang chơi
  validateResource(bookIdParamsSchema), // Validate bookId trong path
  asyncHandler(bookController.playBookHandler) // Handler sẽ được tạo ở controller
);


// << THÊM ROUTE MỚI CHO VIỆC CHỌN CHOICE >>
router.post(
  '/:bookId/play/nodes/:nodeId/choices/:choiceId',
  authenticateToken, // Cần biết user nào đang chơi
  validateResource(playChoiceParamsSchema), // Validate các params trong path
  asyncHandler(bookController.makeChoiceHandler) // Handler sẽ tạo ở controller
);

export default router;