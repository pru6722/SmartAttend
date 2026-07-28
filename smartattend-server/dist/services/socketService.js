"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
class SocketService {
    static io = null;
    static init(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.io.on('connection', (socket) => {
            console.log(`⚡ Socket connected: ${socket.id}`);
            socket.on('joinSessionRoom', (sessionId) => {
                socket.join(`session_${sessionId}`);
                console.log(`Client ${socket.id} joined room: session_${sessionId}`);
            });
            socket.on('leaveSessionRoom', (sessionId) => {
                socket.leave(`session_${sessionId}`);
            });
            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });
        return this.io;
    }
    static getIO() {
        if (!this.io) {
            throw new Error('Socket.IO not initialized');
        }
        return this.io;
    }
    static emitAttendanceMarked(sessionId, data) {
        if (this.io) {
            this.io.to(`session_${sessionId}`).emit('attendanceMarked', data);
        }
    }
    static emitSessionEnded(sessionId) {
        if (this.io) {
            this.io.to(`session_${sessionId}`).emit('sessionEnded', { sessionId });
        }
    }
}
exports.SocketService = SocketService;
