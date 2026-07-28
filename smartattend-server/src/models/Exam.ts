import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  examId: string;
  courseCode: string;
  subjectTitle: string;
  department: string;
  semester: number;
  examDate: Date;
  timeSlot: string;
  roomAllocation: string;
  totalMarks: number;
  passingMarks: number;
  grade?: string;
  score?: number;
  status: 'upcoming' | 'completed';
}

const ExamSchema: Schema = new Schema(
  {
    examId: { type: String, required: true, unique: true },
    courseCode: { type: String, required: true },
    subjectTitle: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true, default: 5 },
    examDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    roomAllocation: { type: String, required: true },
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    grade: { type: String, default: '' },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', ExamSchema);
