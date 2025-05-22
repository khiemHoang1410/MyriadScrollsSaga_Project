// server/src/middleware/validateResource.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config';

// Mở rộng Request interface để thêm thuộc tính validatedQuery, validatedBody, validatedParams
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      validatedBody?: any;
      validatedParams?: any;
    }
  }
}

export const validateResource = (schema: AnyZodObject): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Gán các giá trị đã được parse và biến đổi vào các thuộc tính mới của req
      // Hoặc có thể gán vào req.locals nếu muốn
      if (parsed.body !== undefined) {
        req.validatedBody = parsed.body;
      }
      if (parsed.query !== undefined) {
        req.validatedQuery = parsed.query; // << LƯU VÀO THUỘC TÍNH MỚI
      }
      if (parsed.params !== undefined) {
        req.validatedParams = parsed.params;
      }
      
      // Hoặc nếu muốn giữ nguyên req.body, req.params (thường là an toàn để ghi đè)
      // và chỉ xử lý req.query đặc biệt:
      // req.body = parsed.body;
      // req.params = parsed.params;
      // req.validatedQuery = parsed.query; // Chỉ gán query vào thuộc tính mới

      next();
    } catch (error: any) {
      // ... (phần xử lý lỗi giữ nguyên) ...
      if (error instanceof ZodError) {
        logger.warn('Zod Validation Failed. Raw ZodError issues:');
        error.errors.forEach((issue: ZodIssue, index: number) => {
          logger.warn(`Issue ${index + 1}:`, {
            code: issue.code,
            path: issue.path,
            message: issue.message,
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
          errors: formattedErrors.length > 0 ? formattedErrors : [{ message: 'Unknown Zod validation error' }],
        });
        return;
      }
      logger.error('Error in validateResource (not ZodError):', {
        errorMessage: error.message,
        errorStack: error.stack,
      });
      next(error);
    }
  };