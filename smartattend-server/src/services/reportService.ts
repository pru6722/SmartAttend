import Attendance from '../models/Attendance';
import Session from '../models/Session';
import Student from '../models/Student';

export class ReportService {
  /**
   * Generates a detailed attendance report for a specific session
   */
  public static async getSessionReportData(sessionId: string) {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const enrolledStudents = await Student.find({
      department: session.department,
      section: session.section,
    }).sort({ rollNo: 1 });

    const attendanceRecords = await Attendance.find({ sessionId: session._id });
    const attendanceMap = new Map(attendanceRecords.map((r) => [r.rollNo, r]));

    const report = enrolledStudents.map((student) => {
      const record = attendanceMap.get(student.rollNo);
      return {
        rollNo: student.rollNo,
        name: student.name,
        department: student.department,
        section: student.section,
        subject: session.subject,
        status: record ? 'Present' : 'Absent',
        timestamp: record ? record.timestamp : null,
        networkVerified: record ? record.networkVerified : false,
        faceVerified: record ? record.faceVerified : false,
        deviceId: record ? record.deviceId : '-',
      };
    });

    const totalStudents = enrolledStudents.length;
    const presentCount = attendanceRecords.length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0';

    return {
      session,
      report,
      summary: {
        totalStudents,
        presentCount,
        absentCount,
        attendancePercentage: `${attendancePercentage}%`,
      },
    };
  }
}
