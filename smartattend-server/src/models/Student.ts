import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  password: string;
  department: string;
  year: number;
  section: string;
  subjects: string[];
  primaryDeviceId?: string;
  primaryDeviceHash?: string;
  primaryDeviceName?: string;
  registeredDevices: mongoose.Types.ObjectId[];
  faceTemplateReference?: string;
  isActivated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, unique: true },
    rollNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true, default: 1 },
    section: { type: String, required: true },
    subjects: [{ type: String }],
    primaryDeviceId: { type: String, default: '' },
    primaryDeviceHash: { type: String, default: '' },
    primaryDeviceName: { type: String, default: '' },
    registeredDevices: [{ type: Schema.Types.ObjectId, ref: 'RegisteredDevice' }],
    faceTemplateReference: { type: String, default: '' },
    isActivated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
