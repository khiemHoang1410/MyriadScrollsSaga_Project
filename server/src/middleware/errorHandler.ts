// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '@/utils';
import { logger } from '@/config';
import { HttpStatus, AuthMessages } from '@/types';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction 
) => {
  if (process.env.NODE_ENV === 'development') {
    logger.error(`DEV_ERROR: ${err.name} - ${err.message}`, { stack: err.stack, errorObject: err });
  } else {
    if (err instanceof AppError && !err.isOperational) {
      logger.error('Non-operational error:', { name: err.name, message: err.message, stack: err.stack });
    } else if (!(err instanceof AppError)) {
      logger.error('Unhandled error:', { name: err.name, message: err.message, stack: err.stack });
    }
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ // << BỎ return ở đây
      status: 'error',
      message: err.message,
    });
    return; // Có thể thêm return; ở đây để rõ ràng là hàm kết thúc
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    logger.warn(`JWT Error: ${err.name} - ${err.message}`);
    res.status(HttpStatus.UNAUTHORIZED).json({ // << BỎ return ở đây
      status: 'error',
      message: AuthMessages.TOKEN_INVALID,
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    logger.warn(`JWT Error: ${err.name} - ${err.message}`);
    res.status(HttpStatus.UNAUTHORIZED).json({ // << BỎ return ở đây
      status: 'error',
      message: AuthMessages.TOKEN_EXPIRED,
    });
    return;
  }

  const defaultMessage =
    process.env.NODE_ENV === 'development' || (err instanceof AppError && err.isOperational)
      ? err.message
      : 'An unexpected error occurred on the server. Please try again later.';

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ // << BỎ return ở đây
    status: 'error',
    message: defaultMessage,
  });
  // Không cần next() ở đây vì đây là điểm cuối cùng xử lý lỗi và gửi response.
  // Nếu gọi next(err) nữa có thể gây lặp vô tận hoặc rơi vào default error handler của Express.
  // Nếu bạn muốn gọi next() mà không có lỗi, bạn phải đảm bảo response chưa được gửi.
};