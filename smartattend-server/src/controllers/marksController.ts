import { Response } from 'express';
import Marks from '../models/Marks';
import Student from '../models/Student';
import { AuthenticatedRequest } from '../types/index';

export class MarksController {
  // Teacher: Enter / Update Student Marks
  public static async enterMarks(req: AuthenticatedRequest, res: Response) {
    try {
      const teacherId = req.user?.id;
      const { rollNo, subjectCode, subjectTitle, examType, marksObtained, maxMarks, department, year, section } = req.body;

      const student = await Student.findOne({ rollNo: rollNo.trim() });
      if (!student) {
        return res.status(404).json({ success: false, message: `Student with Roll Number ${rollNo} not found` });
      }

      const mObtained = Number(marksObtained);
      const mMax = Number(maxMarks) || 100;
      const pct = (mObtained / mMax) * 100;

      let grade = 'F';
      if (pct >= 90) grade = 'O';
      else if (pct >= 80) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 60) grade = 'B+';
      else if (pct >= 50) grade = 'B';
      else if (pct >= 40) grade = 'C';

      const marksId = `MRK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const record = await Marks.findOneAndUpdate(
        { studentId: student._id, subjectCode, examType },
        {
          marksId,
          studentId: student._id,
          rollNo: student.rollNo,
          studentName: student.name,
          department: department || student.department,
          year: Number(year) || student.year,
          section: section || student.section,
          subjectCode,
          subjectTitle,
          examType,
          marksObtained: mObtained,
          maxMarks: mMax,
          grade,
          teacherId,
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, message: 'Marks updated & published successfully', record });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Teacher: Get Marks List
  public static async getTeacherMarks(req: AuthenticatedRequest, res: Response) {
    try {
      const teacherId = req.user?.id;
      const marks = await Marks.find({ teacherId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, marks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Student: View Published Marks in Tabular Format
  public static async getStudentMarks(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const marks = await Marks.find({ studentId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, marks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
