import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { SocketService } from './services/socketService';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  SocketService.init(server);

  server.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`🚀 SmartAttend ERP Server running on port ${PORT}`);
    console.log(`📑 OpenAPI Specs available at http://localhost:${PORT}/docs`);
    console.log('----------------------------------------------------');
  });
};

startServer();
