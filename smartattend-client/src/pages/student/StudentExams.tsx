import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { GraduationCap, Calendar, Clock, MapPin, Award, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'marks' | 'timetable' | 'exams'>('marks');
  const [summary, setSummary] = useState<any>({ currentSemester: 5, cgpa: '0.00', sgpa: '0.00', totalCredits: 24 });
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timingSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
  ];

  useEffect(() => {
    apiClient.get('/student/exams')
      .then((res) => {
        setExams(res.data.exams || []);
        if (res.data.semesterSummary) {
          setSummary(res.data.semesterSummary);
        }
      })
      .catch(() => {});

    apiClient.get('/marks/student')
      .then((res) => setMarks(res.data.marks || []))
      .catch(() => {});

    apiClient.get('/timetable')
      .then((res) => setTimetable(res.data.timetable || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingExams = exams.filter((e) => e.status === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/20 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Academic Examination & Evaluation Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Marks Report, Timetable & Schedules</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Semester {summary.currentSemester} | Real-Time Evaluated CGPA & Weekly Timetable Grid</p>
        </div>

        {/* Dynamic Cumulative CGPA Card */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold">Cumulative CGPA</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-400">{summary.cgpa}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('marks')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'marks' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Academic Marks ({marks.length})
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'timetable' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> Class Timetable Grid
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'exams' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Upcoming Exams ({upcomingExams.length})
        </button>
      </div>

      {/* TAB 1: Published Academic Marks */}
      {activeTab === 'marks' && (
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Published Internal & Semester Marks
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Subject Code</th>
                  <th className="p-3.5">Subject Title</th>
                  <th className="p-3.5">Evaluation Type</th>
                  <th className="p-3.5">Marks Obtained</th>
                  <th className="p-3.5">Maximum Marks</th>
                  <th className="p-3.5 rounded-r-xl">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {marks.length > 0 ? (
                  marks.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-mono text-sky-400 font-bold">{m.subjectCode}</td>
                      <td className="p-3.5 font-semibold text-white">{m.subjectTitle}</td>
                      <td className="p-3.5 text-slate-400 font-medium">{m.examType}</td>
                      <td className="p-3.5 font-extrabold text-emerald-400">{m.marksObtained}</td>
                      <td className="p-3.5 text-slate-400 font-semibold">{m.maxMarks}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap shadow-sm">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No internal marks published yet by faculty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* TAB 2: Class Timetable Grid Layout */}
      {activeTab === 'timetable' && (
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Weekly Class Schedule Timetable Grid
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3 border border-slate-800 w-28 bg-slate-950">Day / Time</th>
                  {timingSlots.map((slot) => (
                    <th key={slot} className="p-3 border border-slate-800 text-center font-mono text-sky-400 whitespace-nowrap">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day} className="hover:bg-slate-800/20 transition">
                    <td className="p-3 border border-slate-800 font-bold text-white bg-slate-950/50">{day}</td>
                    {timingSlots.map((slot) => {
                      const entry = timetable.find((t) => t.dayOfWeek === day && t.timeSlot === slot);
                      return (
                        <td key={slot} className="p-2.5 border border-slate-800 min-w-[140px] text-center">
                          {entry ? (
                            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1">
                              <p className="font-mono font-bold text-sky-400 text-xs">{entry.subjectCode}</p>
                              <p className="text-[11px] font-semibold text-white truncate">{entry.subjectTitle}</p>
                              <p className="text-[10px] text-amber-400 font-semibold">{entry.roomNo}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-600 italic">Free Slot</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* TAB 3: Upcoming Examination Schedules */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingExams.length > 0 ? (
            upcomingExams.map((exam) => (
              <GlassCard key={exam._id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                      {exam.courseCode}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">{exam.subjectTitle}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Upcoming
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Exam Date</p>
                      <p className="font-semibold">{new Date(exam.examDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Time Slot</p>
                      <p className="font-semibold">{exam.timeSlot}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 flex items-center justify-between text-xs">
                  <span className="text-sky-300 flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-4 h-4 text-sky-400" /> Room Allocation:
                  </span>
                  <span className="font-bold text-white font-mono">{exam.roomAllocation}</span>
                </div>
              </GlassCard>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No upcoming exams scheduled.</p>
          )}
        </div>
      )}
    </div>
  );
};
