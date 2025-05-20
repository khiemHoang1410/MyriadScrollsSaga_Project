// server/src/middleware/validateResource.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError, ZodIssue } from 'zod'; // Import thêm ZodIssue
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config';

export const validateResource = (schema: AnyZodObject): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Log lỗi Zod một cách cẩn thận hơn
        logger.warn('Zod Validation Failed. Raw ZodError issues:');
        error.errors.forEach((issue: ZodIssue, index: number) => {
          logger.warn(`Issue ${index + 1}:`, {
            code: issue.code,
            path: issue.path,
            message: issue.message,
            // Tránh log toàn bộ issue object nếu nó quá lớn hoặc phức tạp
          });
        });

        const formattedErrors = error.errors.map((issue: ZodIssue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: GeneralMessages.VALIDATION_ERROR,
          errors: formattedErrors.length > 0 ? formattedErrors : [{ message: 'Unknown Zod validation error' }], // Đảm bảo errors không bao giờ rỗng hoàn toàn
        });
        return; // Quan trọng!
      }
      // Nếu không phải ZodError, log lỗi này một cách cẩn thận
      logger.error('Error in validateResource (not ZodError):', {
        errorMessage: error.message,
        errorStack: error.stack,
        // errorObject: error, // Cẩn thận khi log toàn bộ object lỗi
      });
      next(error); // Chuyển lỗi khác cho global error handler
    }
  };