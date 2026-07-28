"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
exports.swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'SmartAttend ERP REST API Documentation',
        version: '1.0.0',
        description: 'Enterprise anti-proxy attendance management system API with 7-step verification pipeline, Socket.IO real-time feed, and role-based access control.',
    },
    servers: [
        {
            url: 'http://localhost:5001',
            description: 'Local Development Server',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    paths: {
        '/api/v1/auth/login': {
            post: {
                summary: 'Login User / Student / Admin',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                    role: { type: 'string', enum: ['student', 'teacher', 'admin'] },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'JWT tokens & user profile' },
                },
            },
        },
        '/api/v1/session/start': {
            post: {
                summary: 'Start 2-minute attendance session & generate 6-digit OTP code',
                security: [{ BearerAuth: [] }],
                responses: { '201': { description: 'Session created with 2-minute countdown timer' } },
            },
        },
        '/api/v1/attendance/mark': {
            post: {
                summary: 'Submit 6-digit OTP code via 7-step verification pipeline',
                security: [{ BearerAuth: [] }],
                responses: { '201': { description: 'Attendance marked' } },
            },
        },
    },
};
