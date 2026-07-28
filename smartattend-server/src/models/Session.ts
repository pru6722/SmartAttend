import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  subject: string;
  department: string;
  year: number;
  section: string;
  attendanceCode: string;
  startTime: Date;
  expiryTime: Date;
  teacherIP: string;
  networkIdentifier: string;
  status: 'active' | 'ended' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherName: { type: String, default: 'Teacher' },
    subject: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true, default: 1 },
    section: { type: String, required: true },
    attendanceCode: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true },
    teacherIP: { type: String, default: '' },
    networkIdentifier: { type: String, default: '' },
    status: { type: String, enum: ['active', 'ended', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);
