"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
