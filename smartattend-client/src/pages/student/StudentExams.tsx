import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { GraduationCap, Calendar, Clock, MapPin, Award, FileSpreadsheet } from 'lucide-react';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ currentSemester: 5, cgpa: '9.2', sgpa: '9.4', totalCredits: 24 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/student/exams')
      .then((res) => {
        setExams(res.data.exams || []);
        if (res.data.semesterSummary) {
          setSummary(res.data.semesterSummary);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingExams = exams.filter((e) => e.status === 'upcoming');
  const completedExams = exams.filter((e) => e.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Academic Examination Portal
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Semester Examination Schedules & Results</h2>
          <p className="text-slate-400 text-sm mt-1">Semester {summary.currentSemester} | Hall Tickets, Room Allocation, Timetables & Grade Report Cards</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold">Cumulative CGPA</p>
            <p className="text-2xl font-extrabold text-purple-400">{summary.cgpa}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Examination Hall Tickets */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" /> Upcoming Semester Examinations
        </h3>

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
                    <MapPin className="w-4 h-4 text-sky-400" /> Allocated Room:
                  </span>
                  <span className="font-bold text-white font-mono">{exam.roomAllocation}</span>
                </div>
              </GlassCard>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No upcoming exams scheduled.</p>
          )}
        </div>
      </div>

      {/* Completed Exam Results */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" /> Completed Exam Grade Report Cards
        </h3>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Course Code</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5 rounded-r-xl">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {completedExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono text-sky-400 font-bold">{exam.courseCode}</td>
                    <td className="p-3.5 font-semibold text-white">{exam.subjectTitle}</td>
                    <td className="p-3.5 text-slate-400">{new Date(exam.examDate).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-white">{exam.score} / {exam.totalMarks}</td>
                    <td className="p-3.5">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exam.grade || 'A+'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
