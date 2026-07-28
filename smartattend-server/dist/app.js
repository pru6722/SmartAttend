"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable trust proxy for cloud deployment (Render, Vercel, Railway, AWS, Heroku)
app.set('trust proxy', true);
// Security Middlewares
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', rateLimiter_1.apiLimiter);
// API Documentation
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// API Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/session', sessionRoutes_1.default);
app.use('/api/v1/attendance', attendanceRoutes_1.default);
app.use('/api/v1/admin', adminRoutes_1.default);
app.use('/api/v1/reports', reportRoutes_1.default);
app.use('/api/v1/student', studentRoutes_1.default);
app.use('/api/v1/teacher', teacherRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', system: 'SmartAttend ERP API', timestamp: new Date() });
});
exports.default = app;
