import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`⚡ Socket connected: ${socket.id}`);

      socket.on('joinSessionRoom', (sessionId: string) => {
        socket.join(`session_${sessionId}`);
        console.log(`Client ${socket.id} joined room: session_${sessionId}`);
      });

      socket.on('leaveSessionRoom', (sessionId: string) => {
        socket.leave(`session_${sessionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public static getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }

  public static emitAttendanceMarked(sessionId: string, data: any) {
    if (this.io) {
      this.io.to(`session_${sessionId}`).emit('attendanceMarked', data);
    }
  }

  public static emitSessionEnded(sessionId: string) {
    if (this.io) {
      this.io.to(`session_${sessionId}`).emit('sessionEnded', { sessionId });
    }
  }
}
