// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError /*, ValidationError */ } from '@/utils'; // Import ValidationError nếu có
import { logger } from '@/config';
import { HttpStatus, AuthMessages } from '@/types';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    logger.error(`DEV_ERROR: ${err.name} - ${err.message}`, { stack: err.stack });
  } else {
    if (err instanceof AppError && !err.isOperational) {
      logger.error('Non-operational error:', { name: err.name, message: err.message, stack: err.stack });
    } else if (!(err instanceof AppError)) {
      logger.error('Unhandled error:', { name: err.name, message: err.message, stack: err.stack });
    }
  }

  // if (err instanceof ValidationError && err.errors) { // Nếu dùng ValidationError class
  //   return res.status(err.statusCode).json({
  //     status: 'error',
  //     message: err.message,
  //     errors: err.errors,
  //   });
  // }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Xử lý các lỗi JWT đặc thù nếu chưa được bao bọc bởi AppError/AuthError
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: 'error',
      message: AuthMessages.TOKEN_INVALID,
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: 'error',
      message: AuthMessages.TOKEN_EXPIRED,
    });
  }

  const defaultMessage = process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred on the server.';
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: defaultMessage,
  });
};