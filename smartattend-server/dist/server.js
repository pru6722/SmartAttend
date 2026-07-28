"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const socketService_1 = require("./services/socketService");
const PORT = process.env.PORT || 5001;
const startServer = async () => {
    await (0, db_1.connectDB)();
    const server = http_1.default.createServer(app_1.default);
    socketService_1.SocketService.init(server);
    server.listen(PORT, () => {
        console.log('----------------------------------------------------');
        console.log(`🚀 SmartAttend ERP Server running on port ${PORT}`);
        console.log(`📑 OpenAPI Specs available at http://localhost:${PORT}/docs`);
        console.log('----------------------------------------------------');
    });
};
startServer();
