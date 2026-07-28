import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  role: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    role: { type: String, required: true },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
