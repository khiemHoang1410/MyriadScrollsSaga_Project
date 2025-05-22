// src/modules/book/book.route.ts
import express from 'express';
import { asyncHandler } from '@/utils'; //
import { validateResource, authenticateToken, authorizeRoles } from '@/middleware'; //
import * as bookController from './book.controller';
import {
  createBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
  getAllBooksSchema, // Schema cho query params của getAllBooks
} from './book.schema';
import { UserRole } from '@/modules/user/user.model'; // Import UserRole từ user module

const router = express.Router();

// --- Định Nghĩa Các Route cho Book ---
// Base path sẽ là /api/books (được định nghĩa trong app.ts)

/**
 * @route POST /
 * @description Tạo một Book mới
 * @access Private (Người dùng đã đăng nhập)
 */
router.post(
  '/',
  authenticateToken, // Cần xác thực để biết ai là author
  validateResource(createBookSchema),
  asyncHandler(bookController.createBookHandler)
);

/**
 * @route GET /
 * @description Lấy danh sách tất cả các Books (có filter, sort, pagination)
 * @access Public (có thể có logic ẩn/hiện sách DRAFT dựa trên user ở service)
 */
router.get(
  '/',
  authenticateToken, // Thêm authenticateToken để service có thể biết currentUserId (nếu có)
                     // và xử lý logic hiển thị sách DRAFT cho chính tác giả.
                     // Nếu không muốn bắt buộc đăng nhập để xem danh sách sách PUBLISHED,
                     // thì middleware này có thể làm optional hoặc xử lý trong service.
                     // Hiện tại để authenticateToken để controller có req.user
  validateResource(getAllBooksSchema), // Validate query params
  asyncHandler(bookController.getAllBooksHandler)
);

/**
 * @route GET /:bookId
 * @description Lấy thông tin chi tiết một Book theo ID
 * @access Public (có thể có logic ẩn/hiện sách DRAFT dựa trên user ở service)
 */
router.get(
  '/:bookId',
  authenticateToken, // Tương tự getAllBooks, để service kiểm tra quyền xem sách DRAFT
  validateResource(bookIdParamsSchema),
  asyncHandler(bookController.getBookByIdHandler)
);

/**
 * @route PUT /:bookId
 * @description Cập nhật một Book theo ID
 * @access Private (Chỉ author của sách hoặc Admin)
 */
router.put(
  '/:bookId',
  authenticateToken, // Cần xác thực để biết ai là người thực hiện và kiểm tra quyền
  // authorizeRoles có thể không cần ở đây nếu logic kiểm tra author/admin đã có trong service
  // Tuy nhiên, nếu muốn chặn sớm hơn, có thể thêm:
  // authorizeRoles(UserRole.ADMIN, UserRole.USER), // Sau đó service sẽ check cụ thể hơn là USER này có phải author không
  validateResource(updateBookSchema),
  asyncHandler(bookController.updateBookByIdHandler)
);

/**
 * @route DELETE /:bookId
 * @description Xóa một Book theo ID
 * @access Private (Chỉ author của sách hoặc Admin)
 */
router.delete(
  '/:bookId',
  authenticateToken, // Cần xác thực để biết ai là người thực hiện và kiểm tra quyền
  // Tương tự PUT, authorizeRoles có thể thêm ở đây hoặc để service xử lý
  validateResource(bookIdParamsSchema),
  asyncHandler(bookController.deleteBookByIdHandler)
);

// --- (Tùy chọn) Routes cho quản lý PageNode, Choice riêng lẻ ---
// Ví dụ:
// router.post(
//   '/:bookId/nodes',
//   authenticateToken,
//   validateResource(/* schema cho add node */),
//   asyncHandler(/* controller.addPageNodeHandler */)
// );
// router.put(
//   '/:bookId/nodes/:nodeId',
//   authenticateToken,
//   validateResource(/* schema cho update node */),
//   asyncHandler(/* controller.updatePageNodeHandler */)
// );
// ...

export default router;