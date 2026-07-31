"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Student_1 = __importDefault(require("../models/Student"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Session_1 = __importDefault(require("../models/Session"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Marks_1 = __importDefault(require("../models/Marks"));
const User_1 = __importDefault(require("../models/User"));
class StudentController {
    static async findStudent(studentId, email) {
        let student = null;
        if (studentId) {
            try {
                student = await Student_1.default.findById(studentId).select('-password').populate('registeredDevices');
            }
            catch (e) { }
        }
        if (!student && email) {
            student = await Student_1.default.findOne({ email: email.toLowerCase() }).select('-password').populate('registeredDevices');
        }
        return student;
    }
    static async getProfile(req, res) {
        try {
            const studentId = req.user?.id;
            const userEmail = req.user?.email;
            let student = await StudentController.findStudent(studentId, userEmail);
            if (!student && userEmail) {
                const u = await User_1.default.findOne({ email: userEmail.toLowerCase() }).select('-password');
                if (u) {
                    return res.status(200).json({
                        success: true,
                        student: {
                            ...u.toObject(),
                            rollNo: u.role.toUpperCase(),
                            faceRegistered: true,
                            primaryDeviceRegistered: true,
                        },
                    });
                }
            }
            if (!student) {
                const newPass = await bcryptjs_1.default.hash('Student@123', 10);
                student = await Student_1.default.create({
                    studentId: `STU-${Date.now()}`,
                    rollNo: `21CS${Math.floor(100 + Math.random() * 900)}`,
                    name: req.user?.name || 'Student User',
                    email: (userEmail || 'student@smartattend.edu').toLowerCase(),
                    password: newPass,
                    department: 'CSE',
                    section: 'A',
                    year: 3,
                    isActivated: true,
                });
            }
            const studentObj = student.toObject();
            return res.status(200).json({
                success: true,
                student: {
                    ...studentObj,
                    faceRegistered: Boolean(student.faceTemplateReference && student.faceTemplateReference.length > 5),
                    primaryDeviceRegistered: Boolean(student.primaryDeviceHash && student.primaryDeviceHash.length > 5),
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const studentId = req.user?.id;
            const userEmail = req.user?.email;
            const { password, currentPassword } = req.body;
            let student = await StudentController.findStudent(studentId, userEmail);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            if (password) {
                if (currentPassword) {
                    const isMatch = await bcryptjs_1.default.compare(currentPassword, student.password);
                    if (!isMatch) {
                        return res.status(400).json({ success: false, message: 'Current password does not match' });
                    }
                }
                student.password = await bcryptjs_1.default.hash(password, 10);
                await student.save();
            }
            const studentData = student.toObject();
            return res.status(200).json({
                success: true,
                student: {
                    ...studentData,
                    faceRegistered: Boolean(student.faceTemplateReference && student.faceTemplateReference.length > 5),
                    primaryDeviceRegistered: Boolean(student.primaryDeviceHash && student.primaryDeviceHash.length > 5),
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async registerFaceAndDevice(req, res) {
        try {
            const studentId = req.user?.id;
            const userEmail = req.user?.email;
            const { faceTemplate, registerPrimaryDevice = true, fingerprintHash, platform, browser } = req.body;
            let student = await StudentController.findStudent(studentId, userEmail);
            if (!student) {
                const newPass = await bcryptjs_1.default.hash('Student@123', 10);
                student = await Student_1.default.create({
                    studentId: `STU-${Date.now()}`,
                    rollNo: `21CS${Math.floor(100 + Math.random() * 900)}`,
                    name: req.user?.name || 'Student User',
                    email: (userEmail || 'student@smartattend.edu').toLowerCase(),
                    password: newPass,
                    department: 'CSE',
                    section: 'A',
                    year: 3,
                    isActivated: true,
                });
            }
            if (faceTemplate) {
                student.faceTemplateReference = faceTemplate;
            }
            if (registerPrimaryDevice || !student.primaryDeviceHash) {
                const devId = `DEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                student.primaryDeviceId = devId;
                student.primaryDeviceHash = fingerprintHash || `fp_${Date.now()}`;
                student.primaryDeviceName = `${platform || 'Primary Mobile Device'} (${browser || 'Web Browser'})`;
            }
            await student.save();
            return res.status(200).json({
                success: true,
                message: 'Facial biometric profile and Primary Device registered successfully!',
                student: {
                    ...student.toObject(),
                    faceRegistered: Boolean(student.faceTemplateReference),
                    primaryDeviceRegistered: Boolean(student.primaryDeviceHash),
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async setPrimaryDevice(req, res) {
        try {
            const studentId = req.user?.id;
            const { fingerprintHash, platform, browser } = req.body;
            const student = await Student_1.default.findById(studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            const devId = `DEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            student.primaryDeviceId = devId;
            student.primaryDeviceHash = fingerprintHash;
            student.primaryDeviceName = `${platform || 'Primary Mobile Device'} (${browser || 'Web Browser'})`;
            await student.save();
            return res.status(200).json({
                success: true,
                message: 'Primary campus device registered successfully',
                student,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getAttendanceHistory(req, res) {
        try {
            const studentId = req.user?.id;
            const records = await Attendance_1.default.find({ studentId }).populate('sessionId').sort({ timestamp: -1 });
            const student = await Student_1.default.findById(studentId);
            let totalSessions = 0;
            if (student) {
                totalSessions = await Session_1.default.countDocuments({
                    department: student.department,
                    section: student.section,
                });
            }
            const attendedSessions = records.length;
            const percentage = totalSessions > 0 ? ((attendedSessions / totalSessions) * 100).toFixed(1) : '100.0';
            return res.status(200).json({
                success: true,
                history: records,
                stats: {
                    totalSessions,
                    attendedSessions,
                    percentage: `${percentage}%`,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getStudentExams(req, res) {
        try {
            const studentId = req.user?.id;
            const student = await Student_1.default.findById(studentId);
            const dept = student?.department || 'CSE';
            let exams = await Exam_1.default.find({ department: dept }).sort({ examDate: 1 });
            if (exams.length === 0) {
                await Exam_1.default.create([
                    {
                        examId: 'EXM-301',
                        courseCode: 'CS301',
                        subjectTitle: 'Operating Systems & Security',
                        department: dept,
                        semester: 5,
                        examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                        timeSlot: '10:00 AM - 01:00 PM',
                        roomAllocation: 'Hall 304 - Desk 12',
                        totalMarks: 100,
                        passingMarks: 40,
                        status: 'upcoming',
                    },
                    {
                        examId: 'EXM-302',
                        courseCode: 'CS302',
                        subjectTitle: 'Database Management Systems',
                        department: dept,
                        semester: 5,
                        examDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                        timeSlot: '02:00 PM - 05:00 PM',
                        roomAllocation: 'Hall 108 - Desk 05',
                        totalMarks: 100,
                        passingMarks: 40,
                        status: 'upcoming',
                    },
                ]);
                exams = await Exam_1.default.find({ department: dept }).sort({ examDate: 1 });
            }
            // Calculate Real Dynamic CGPA & SGPA from published Marks
            const studentMarks = await Marks_1.default.find({ studentId });
            let cgpa = '0.00';
            let sgpa = '0.00';
            if (studentMarks.length > 0) {
                const totalPct = studentMarks.reduce((acc, curr) => acc + (curr.marksObtained / curr.maxMarks) * 100, 0);
                const avgPct = totalPct / studentMarks.length;
                cgpa = (avgPct / 10).toFixed(2);
                sgpa = (avgPct / 10).toFixed(2);
            }
            return res.status(200).json({
                success: true,
                exams,
                semesterSummary: {
                    currentSemester: 5,
                    cgpa,
                    sgpa,
                    totalCredits: 24,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.StudentController = StudentController;
