// src/modules/book/book.route.ts
import express from 'express';
import { asyncHandler } from '@/utils';
import { validateResource, authenticateToken, authorizeRoles } from '@/middleware'; // Đảm bảo authorizeRoles được import
import * as bookController from './book.controller';
import {
  createBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
  getAllBooksSchema,
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
  authenticateToken,
  validateResource(getAllBooksSchema),
  asyncHandler(bookController.getAllBooksHandler)
);

router.get(
  '/:bookId',
  authenticateToken,
  validateResource(bookIdParamsSchema),
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

export default router;