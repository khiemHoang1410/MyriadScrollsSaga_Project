// server/src/modules/language/language.route.ts
import express from 'express';
import * as languageController from './language.controller'; // Import controller handlers
import {
  createLanguageSchema,
  updateLanguageSchema,
  languageIdParamsSchema,
} from './language.schema'; // Import Zod schemas
import { validateResource } from '@/middleware/validateResource';
import { authenticateToken } from '@/middleware/authenticateToken';
import { authorizeRoles } from '@/middleware/authorizeRoles';
import { UserRole } from '@/types/api.types'; // Hoặc từ '@/models/UserModel' nếu UserRole được export từ đó
import { asyncHandler } from '@/utils/asyncHandler';

const router = express.Router();

// --- Định Nghĩa Các Route cho Language ---
// Base path sẽ là /api/languages (được định nghĩa trong app.ts)

/**
 * @route POST /
 * @description Tạo một Language mới (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN), // Chỉ Admin mới được tạo Language
  validateResource(createLanguageSchema), // Validate body request bằng Zod schema
  asyncHandler(languageController.createLanguageHandler) // Bọc controller handler bằng asyncHandler
);

/**
 * @route GET /
 * @description Lấy danh sách tất cả các Languages (Public)
 * @queryparam isActive boolean - Lọc theo trạng thái active (ví dụ: /?isActive=true)
 * @access Public
 */
router.get(
  '/',
  // Không cần validateResource ở đây nếu query param là optional và đã xử lý trong controller
  asyncHandler(languageController.getAllLanguagesHandler)
);

/**
 * @route GET /:languageId
 * @description Lấy thông tin chi tiết một Language theo ID (Public)
 * @access Public
 */
router.get(
  '/:languageId',
  validateResource(languageIdParamsSchema), // Validate languageId trong params
  asyncHandler(languageController.getLanguageByIdHandler)
);

/**
 * @route PUT /:languageId
 * @description Cập nhật một Language theo ID (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.put(
  '/:languageId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN), // Chỉ Admin mới được cập nhật
  validateResource(updateLanguageSchema), // Validate cả params (languageId) và body
  asyncHandler(languageController.updateLanguageByIdHandler)
);

/**
 * @route DELETE /:languageId
 * @description Xóa một Language theo ID (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.delete(
  '/:languageId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN), // Chỉ Admin mới được xóa
  validateResource(languageIdParamsSchema), // Validate languageId trong params
  asyncHandler(languageController.deleteLanguageByIdHandler)
);

export default router;