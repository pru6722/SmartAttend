import mongoose, { Schema, Document } from 'mongoose';

export interface IMarks extends Document {
  marksId: string;
  studentId: mongoose.Types.ObjectId;
  rollNo: string;
  studentName: string;
  department: string;
  year: number;
  section: string;
  subjectCode: string;
  subjectTitle: string;
  examType: 'Internal 1' | 'Internal 2' | 'Mid-Term' | 'End-Semester';
  marksObtained: number;
  maxMarks: number;
  grade: string;
  teacherId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarksSchema: Schema = new Schema(
  {
    marksId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    rollNo: { type: String, required: true },
    studentName: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    section: { type: String, required: true },
    subjectCode: { type: String, required: true },
    subjectTitle: { type: String, required: true },
    examType: { type: String, enum: ['Internal 1', 'Internal 2', 'Mid-Term', 'End-Semester'], required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, default: 'A' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMarks>('Marks', MarksSchema);
