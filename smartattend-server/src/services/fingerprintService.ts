import RegisteredDevice, { IRegisteredDevice } from '../models/RegisteredDevice';
import mongoose from 'mongoose';

export class FingerprintService {
  /**
   * Checks if student device is registered, or registers a new device
   */
  public static async verifyDevice(
    studentId: string,
    fingerprintHash: string,
    platform: string,
    browser: string
  ): Promise<{ isKnownDevice: boolean; deviceId: string; registeredDevice: IRegisteredDevice }> {
    const existingDevice = await RegisteredDevice.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
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
    const newDevice = await RegisteredDevice.create({
      deviceId: newDeviceId,
      studentId: new mongoose.Types.ObjectId(studentId),
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
