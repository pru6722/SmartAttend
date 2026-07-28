import mongoose, { Schema, Document } from 'mongoose';

export interface IRegisteredDevice extends Document {
  deviceId: string;
  studentId: mongoose.Types.ObjectId;
  fingerprintHash: string;
  platform: string;
  browser: string;
  registeredDate: Date;
  lastLogin: Date;
}

const RegisteredDeviceSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    fingerprintHash: { type: String, required: true },
    platform: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown' },
    registeredDate: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IRegisteredDevice>('RegisteredDevice', RegisteredDeviceSchema);
