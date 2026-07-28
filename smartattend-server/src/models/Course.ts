import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  title: string;
  department: string;
  year: number;
  assignedTeachers: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true, default: 1 },
    assignedTeachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);
