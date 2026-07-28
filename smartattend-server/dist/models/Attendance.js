"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AttendanceSchema = new mongoose_1.Schema({
    attendanceId: { type: String, required: true, unique: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    rollNo: { type: String, required: true },
    studentName: { type: String, required: true },
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Session', required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: String, required: true },
    studentIP: { type: String, default: '' },
    networkIdentifier: { type: String, default: '' },
    networkVerified: { type: Boolean, default: false },
    faceVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['present', 'absent', 'flagged'], default: 'present' },
}, { timestamps: true });
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Attendance', AttendanceSchema);
