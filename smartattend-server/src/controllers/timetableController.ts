import { Response } from 'express';
import Timetable from '../models/Timetable';
import { AuthenticatedRequest } from '../types/index';

export class TimetableController {
  // Admin: Create / Update Section-wide Timetable Slot
  public static async createTimetableSlot(req: AuthenticatedRequest, res: Response) {
    try {
      const { department, year, section, dayOfWeek, timeSlot, subjectCode, subjectTitle, teacherName, roomNo } = req.body;

      if (!department || !section || !dayOfWeek || !timeSlot || !subjectCode) {
        return res.status(400).json({ success: false, message: 'Department, section, day, time slot, and subject code are required' });
      }

      const timetableId = `TT-${department}-${year}${section}-${dayOfWeek.substring(0,3)}-${Date.now()}`;

      const slot = await Timetable.create({
        timetableId,
        department: department.toUpperCase(),
        year: Number(year) || 1,
        section: section.toUpperCase(),
        dayOfWeek,
        timeSlot,
        subjectCode: subjectCode.toUpperCase(),
        subjectTitle: subjectTitle || 'Subject Class',
        teacherName: teacherName || 'Faculty',
        roomNo: roomNo || 'Hall 101',
      });

      return res.status(201).json({ success: true, message: `Timetable slot added for ${department}-${section} (${dayOfWeek})`, slot });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get Timetable for Section
  public static async getSectionTimetable(req: AuthenticatedRequest, res: Response) {
    try {
      const { department, year, section } = req.query;
      let query: any = {};
      if (department) query.department = (department as string).toUpperCase();
      if (year) query.year = Number(year);
      if (section) query.section = (section as string).toUpperCase();

      const timetable = await Timetable.find(query).sort({ dayOfWeek: 1, timeSlot: 1 });
      return res.status(200).json({ success: true, timetable });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
