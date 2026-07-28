"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintService = void 0;
const RegisteredDevice_1 = __importDefault(require("../models/RegisteredDevice"));
const mongoose_1 = __importDefault(require("mongoose"));
class FingerprintService {
    /**
     * Checks if student device is registered, or registers a new device
     */
    static async verifyDevice(studentId, fingerprintHash, platform, browser) {
        const existingDevice = await RegisteredDevice_1.default.findOne({
            studentId: new mongoose_1.default.Types.ObjectId(studentId),
            fingerprintHash,
        });
        if (existingDevice) {
            existingDevice.lastLogin = new Date();
            await existingDevice.save();
            return {
                isKnownDevice: true,
                deviceId: existingDevice.deviceId,
                registeredDevice: existingDevice,
            };
        }
        // New device detected
        const newDeviceId = `DEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newDevice = await RegisteredDevice_1.default.create({
            deviceId: newDeviceId,
            studentId: new mongoose_1.default.Types.ObjectId(studentId),
            fingerprintHash,
            platform: platform || 'Unknown',
            browser: browser || 'Unknown',
            registeredDate: new Date(),
            lastLogin: new Date(),
        });
        return {
            isKnownDevice: false,
            deviceId: newDeviceId,
            registeredDevice: newDevice,
        };
    }
}
exports.FingerprintService = FingerprintService;
