// server/src/middleware/validateResource.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config';
// import { ValidationError } from '@/utils'; // Nếu có ValidationError class

export const validateResource = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ // Dùng parseAsync nếu schema có async refinements
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        logger.warn('Zod Validation Failed:', {
          path: req.path,
          method: req.method,
          errors: formattedErrors,
        });
        // Nếu có ValidationError class:
        // return next(new ValidationError(GeneralMessages.VALIDATION_ERROR, formattedErrors));
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: GeneralMessages.VALIDATION_ERROR,
          errors: formattedErrors,
        });
      }
      return next(error); // Chuyển lỗi khác cho global error handler
    }
  };

export default validateResource; // Đảm bảo export default