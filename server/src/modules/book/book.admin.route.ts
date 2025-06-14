// File: server/src/modules/book/book.admin.route.ts

import { Router } from 'express';
import  {bookController}  from '@/modules/book'; // <--- Dùng alias
import { validateResource } from '@/middleware'; // <--- Dùng alias
import { createBookSchema, updateBookSchema } from '@/modules/book/book.schema'; // <--- Dùng alias

const router = Router();

router.post(
  '/',
  validateResource(createBookSchema),
  bookController.createBookHandler
);

router.put(
  '/:bookId',
  validateResource(updateBookSchema),
  bookController.updateBookByIdHandler
);

router.delete('/:bookId', bookController.deleteBookByIdHandler);

export default router;