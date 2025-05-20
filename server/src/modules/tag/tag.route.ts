// server/src/modules/tag/tag.route.ts
import express from 'express';
import { tagController } from './'; // Import controller từ barrel file của module tag
import {
  createTagSchema,
  updateTagSchema,
  tagIdParamsSchema,
} from './tag.schema'; // Import Zod schemas
import { validateResource } from '@/middleware/validateResource';
import { authenticateToken } from '@/middleware/authenticateToken';
import { authorizeRoles } from '@/middleware/authorizeRoles';
import { UserRole } from '@/types'; // Enum UserRole
import { asyncHandler } from '@/utils'; // asyncHandler "thần thánh"

const router = express.Router();

// --- Định Nghĩa Các Route cho Tag ---
// Base path: /api/tags (sẽ được định nghĩa trong app.ts)

/**
 * @route POST /api/tags
 * @description Tạo một Tag mới (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(createTagSchema),
  asyncHandler(tagController.createTagHandler)
);

/**
 * @route GET /api/tags
 * @description Lấy danh sách tất cả các Tags (Public)
 * @access Public
 */
router.get('/', asyncHandler(tagController.getAllTagsHandler));

/**
 * @route GET /api/tags/:tagId
 * @description Lấy thông tin chi tiết một Tag theo ID (Public)
 * @access Public
 */
router.get(
  '/:tagId',
  validateResource(tagIdParamsSchema),
  asyncHandler(tagController.getTagByIdHandler)
);

/**
 * @route PUT /api/tags/:tagId
 * @description Cập nhật một Tag theo ID (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.put(
  '/:tagId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(updateTagSchema),
  asyncHandler(tagController.updateTagByIdHandler)
);

/**
 * @route DELETE /api/tags/:tagId
 * @description Xóa một Tag theo ID (yêu cầu quyền Admin)
 * @access Private (Admin)
 */
router.delete(
  '/:tagId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(tagIdParamsSchema),
  asyncHandler(tagController.deleteTagByIdHandler)
);

export default router;