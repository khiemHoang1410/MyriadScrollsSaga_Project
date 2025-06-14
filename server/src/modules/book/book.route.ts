// File: server/src/modules/book/book.route.ts (Sau khi dọn dẹp)

import { Router } from 'express';
import { bookController } from '@/modules/book'; // <--- Dùng alias
import { optionalAuthenticateToken } from '@/middleware'; // <--- Dùng alias

const router = Router();

router.get('/', optionalAuthenticateToken, bookController.getAllBooksHandler);

router.get('/:bookId', optionalAuthenticateToken, bookController.getBookByIdHandler);

export default router;