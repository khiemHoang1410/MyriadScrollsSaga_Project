// server/src/middleware/authorizeRoles.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole, HttpStatus, AuthMessages } from '@/types';
import { AuthError } from '@/utils';
import { logger } from '@/config';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      logger.warn('authorizeRoles middleware called without req.user or req.user.roles populated.');
      return next(new AuthError(AuthMessages.TOKEN_INVALID, HttpStatus.FORBIDDEN)); // Hoặc lỗi khác phù hợp
    }

    const userRoles = req.user.roles;
    const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(
        `User ${req.user.username} (roles: ${userRoles.join(', ')}) attempted to access a resource restricted to roles: ${allowedRoles.join(', ')}`
      );
      return next(
        new AuthError(
          `${AuthMessages.ACCESS_DENIED_MISSING_ROLES} Required: ${allowedRoles.join(' or ')}.`,
          HttpStatus.FORBIDDEN
        )
      );
    }
    next();
  };
};