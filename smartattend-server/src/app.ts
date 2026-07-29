import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import adminRoutes from './routes/adminRoutes';
import reportRoutes from './routes/reportRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import marksRoutes from './routes/marksRoutes';
import timetableRoutes from './routes/timetableRoutes';
import queryRoutes from './routes/queryRoutes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

// Enable trust proxy for cloud deployment (Render, Vercel, Railway, AWS, Heroku)
app.set('trust proxy', true);

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/marks', marksRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/queries', queryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', system: 'SmartAttend ERP API', timestamp: new Date() });
});

export default app;
