import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  attendanceId: string;
  studentId: mongoose.Types.ObjectId;
  rollNo: string;
  studentName: string;
  sessionId: mongoose.Types.ObjectId;
  timestamp: Date;
  deviceId: string;
  studentIP: string;
  networkIdentifier: string;
  networkVerified: boolean;
  faceVerified: boolean;
  status: 'present' | 'absent' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    attendanceId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    rollNo: { type: String, required: true },
    studentName: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: String, required: true },
    studentIP: { type: String, default: '' },
    networkIdentifier: { type: String, default: '' },
    networkVerified: { type: Boolean, default: false },
    faceVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['present', 'absent', 'flagged'], default: 'present' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
