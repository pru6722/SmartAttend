import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  timetableId: string;
  department: string;
  year: number;
  section: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  subjectCode: string;
  subjectTitle: string;
  teacherName: string;
  roomNo: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema = new Schema(
  {
    timetableId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    section: { type: String, required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    timeSlot: { type: String, required: true },
    subjectCode: { type: String, required: true },
    subjectTitle: { type: String, required: true },
    teacherName: { type: String, default: 'Faculty Staff' },
    roomNo: { type: String, default: 'Lab 101' },
  },
  { timestamps: true }
);

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);
