"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarksController = void 0;
const Marks_1 = __importDefault(require("../models/Marks"));
const Student_1 = __importDefault(require("../models/Student"));
class MarksController {
    // Teacher: Enter / Update Student Marks
    static async enterMarks(req, res) {
        try {
            const teacherId = req.user?.id;
            const { rollNo, subjectCode, subjectTitle, examType, marksObtained, maxMarks, department, year, section } = req.body;
            const student = await Student_1.default.findOne({ rollNo: rollNo.trim() });
            if (!student) {
                return res.status(404).json({ success: false, message: `Student with Roll Number ${rollNo} not found` });
            }
            const mObtained = Number(marksObtained);
            const mMax = Number(maxMarks) || 100;
            const pct = (mObtained / mMax) * 100;
            let grade = 'F';
            if (pct >= 90)
                grade = 'O';
            else if (pct >= 80)
                grade = 'A+';
            else if (pct >= 70)
                grade = 'A';
            else if (pct >= 60)
                grade = 'B+';
            else if (pct >= 50)
                grade = 'B';
            else if (pct >= 40)
                grade = 'C';
            const marksId = `MRK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
            const record = await Marks_1.default.findOneAndUpdate({ studentId: student._id, subjectCode, examType }, {
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
            }, { upsert: true, new: true });
            return res.status(200).json({ success: true, message: 'Marks updated & published successfully', record });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Teacher: Get Marks List
    static async getTeacherMarks(req, res) {
        try {
            const teacherId = req.user?.id;
            const marks = await Marks_1.default.find({ teacherId }).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, marks });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Student: View Published Marks in Tabular Format
    static async getStudentMarks(req, res) {
        try {
            const studentId = req.user?.id;
            const marks = await Marks_1.default.find({ studentId }).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, marks });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.MarksController = MarksController;
