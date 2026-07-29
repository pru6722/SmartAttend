import mongoose, { Schema, Document } from 'mongoose';

export interface IQueryTicket extends Document {
  ticketId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'student' | 'teacher';
  senderEmail: string;
  department: string;
  subject: string;
  message: string;
  adminResponse?: string;
  status: 'pending' | 'completed';
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QueryTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['student', 'teacher'], required: true },
    senderEmail: { type: String, required: true },
    department: { type: String, default: 'General' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    adminResponse: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IQueryTicket>('QueryTicket', QueryTicketSchema);
