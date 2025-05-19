// server/src/modules/genre/genre.route.ts
import express from 'express';
import { genreController } from './';
import {
  createGenreSchema,
  updateGenreSchema,
  genreIdParamsSchema,
} from './genre.schema';
import { validateResource } from '@/middleware/validateResource';
import { authenticateToken } from '@/middleware/authenticateToken';
import { authorizeRoles } from '@/middleware/authorizeRoles';
import { UserRole } from '@/types';
import { asyncHandler } from '@/utils'; // << IMPORT LẠI ASYNCHANDLER

const router = express.Router();

// Route test cũ, có thể giữ lại hoặc xóa
// Hoặc nếu testGenreHandler là sync và đã có try-catch next(error) thì không cần bọc.
// Để an toàn, handler đồng bộ của mình đã có try-catch next(error) nên ko cần asyncHandler.
// router.get('/test', genreController.testGenreHandler);


// --- Định Nghĩa Các Route cho Genre ---
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(createGenreSchema),
  asyncHandler(genreController.createGenreHandler)
);

router.get('/', asyncHandler(genreController.getAllGenresHandler));

router.get(
  '/:genreId',
  validateResource(genreIdParamsSchema),
  asyncHandler(genreController.getGenreByIdHandler)
);

router.put(
  '/:genreId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(updateGenreSchema),
  asyncHandler(genreController.updateGenreByIdHandler)
);

router.delete(
  '/:genreId',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateResource(genreIdParamsSchema),
  asyncHandler(genreController.deleteGenreByIdHandler)
);

export default router;