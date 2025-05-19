// server/src/middleware/validateResource.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'; // Đảm bảo RequestHandler được import
import { AnyZodObject, ZodError } from 'zod';
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config'; // Đảm bảo logger được import

export const validateResource = (schema: AnyZodObject): RequestHandler => // Kiểu trả về là RequestHandler
  async (req: Request, res: Response, next: NextFunction): Promise<void> => { // Kiểu trả về của hàm async là Promise<void>
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // Nếu thành công, gọi next()
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Khai báo formattedErrors ở đây!
        const formattedErrors = error.errors.map((err) => ({ // << DÒNG KHAI BÁO formattedErrors
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        logger.warn('Zod Validation Failed:', {
          path: req.path,
          method: req.method,
          errors: formattedErrors, // Sử dụng formattedErrors đã khai báo
        });
        res.status(HttpStatus.BAD_REQUEST).json({ // Gửi response lỗi
          status: 'error',
          message: GeneralMessages.VALIDATION_ERROR,
          errors: formattedErrors, // Sử dụng formattedErrors đã khai báo
        });
        return; // Kết thúc hàm ở đây sau khi gửi response
      }
      // Nếu không phải ZodError, chuyển lỗi cho global error handler
      next(error);
    }
  };
