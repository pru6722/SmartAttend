import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index';

export const authorizeRoles = (...roles: (UserRole | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required',
      });
    }

    const userRole = (req.user.role || '').toString().toLowerCase();
    const allowedRoles = roles.map((r) => r.toString().toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' does not have access to this resource`,
      });
    }

    next();
  };
};
