"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.attendanceSubmissionLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.attendanceSubmissionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10, // Max 10 attempts per minute to prevent OTP brute-forcing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attendance submission attempts. Please try again after 1 minute.',
    },
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
