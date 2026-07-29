import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Award, Plus, CheckCircle2, AlertCircle, Filter, UserCheck } from 'lucide-react';

export const TeacherMarks: React.FC = () => {
  const [marksList, setMarksList] = useState<any[]>([]);
  const [sectionStudents, setSectionStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);

  // Cascading Selection State
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedYear, setSelectedYear] = useState('3');
  const [selectedSection, setSelectedSection] = useState('A');

  const [formData, setFormData] = useState({
    rollNo: '',
    studentName: '',
    subjectCode: 'CS301',
    subjectTitle: 'Operating Systems & Security',
    examType: 'Internal 1',
    marksObtained: '',
    maxMarks: '100',
  });

  const subjectOptions = [
    { code: 'CS301', title: 'Operating Systems & Security' },
    { code: 'CS302', title: 'Database Management Systems' },
    { code: 'CS303', title: 'Computer Networks & Protocols' },
    { code: 'EC201', title: 'Digital Electronics & Microprocessors' },
    { code: 'ME101', title: 'Thermodynamics & Engineering Mechanics' },
  ];

  const fetchMarks = () => {
    apiClient.get('/marks/teacher')
      .then((res) => setMarksList(res.data.marks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchStudents = () => {
    apiClient.get(`/teacher/students?department=${selectedDept}&year=${selectedYear}&section=${selectedSection}`)
      .then((res) => {
        const list = res.data.students || [];
        setSectionStudents(list);
        if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            rollNo: list[0].rollNo,
            studentName: list[0].name,
          }));
        } else {
          setFormData((prev) => ({ ...prev, rollNo: '', studentName: '' }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedYear, selectedSection]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rNo = e.target.value;
    const found = sectionStudents.find((s) => s.rollNo === rNo);
    setFormData({
      ...formData,
      rollNo: rNo,
      studentName: found ? found.name : '',
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sCode = e.target.value;
    const found = subjectOptions.find((s) => s.code === sCode);
    setFormData({
      ...formData,
      subjectCode: sCode,
      subjectTitle: found ? found.title : 'Subject Class',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.rollNo) {
      setStatus({ type: 'error', message: 'Please select a student from the section dropdown' });
      return;
    }

    try {
      const payload = {
        ...formData,
        department: selectedDept,
        year: selectedYear,
        section: selectedSection,
      };

      const res = await apiClient.post('/marks', payload);
      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        setFormData((prev) => ({ ...prev, marksObtained: '' }));
        fetchMarks();
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to publish marks' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-6">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          Academic Marks Portal
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">Publish Student Internal & Semester Marks</h2>
        <p className="text-slate-400 text-sm mt-1">Select class section, subject, and student roll number to publish dynamic report cards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card with Cascading Dropdowns */}
        <GlassCard className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-sky-400" /> Publish Marks Entry
          </h3>

          {status && (
            <div className={`mb-4 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown 1: Select Section (Dept + Year + Section) */}
            <div>
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> 1. Select Class Section
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="EEE">EEE</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
            </div>

            {/* Dropdown 2: Select Subject */}
            <div>
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                2. Select Subject Course
              </label>
              <select
                value={formData.subjectCode}
                onChange={handleSubjectChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none focus:border-sky-500"
              >
                {subjectOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Select Enrolled Student */}
            <div>
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> 3. Select Student (Roll No & Name)
              </label>
              {sectionStudents.length > 0 ? (
                <select
                  value={formData.rollNo}
                  onChange={handleStudentChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  {sectionStudents.map((st) => (
                    <option key={st._id} value={st.rollNo}>
                      {st.rollNo} - {st.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-semibold">
                  No students found in {selectedDept}-{selectedSection} (Year {selectedYear}). Add students in Admin portal.
                </div>
              )}
            </div>

            {/* Dropdown 4: Exam Evaluation Type */}
            <div>
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                4. Select Exam Evaluation Type
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none focus:border-sky-500"
              >
                <option value="Internal 1">Internal 1</option>
                <option value="Internal 2">Internal 2</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Semester">End-Semester</option>
              </select>
            </div>

            {/* Marks Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marks Obtained</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.marksObtained}
                  onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                  placeholder="e.g. 85"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 text-base font-extrabold outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Marks</label>
                <input
                  type="number"
                  required
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-base font-extrabold outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.rollNo}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-extrabold rounded-2xl shadow-lg transition text-xs disabled:opacity-50"
            >
              Publish Marks to Student Grade Card
            </button>
          </form>
        </GlassCard>

        {/* Display Marks Table */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Published Student Marks Log ({marksList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Exam Type</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {marksList.length > 0 ? (
                  marksList.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-sky-400 font-bold">{m.rollNo}</td>
                      <td className="p-3 font-semibold text-white">{m.studentName}</td>
                      <td className="p-3 text-slate-400 font-mono">{m.department}-{m.section}</td>
                      <td className="p-3 text-slate-300">{m.subjectCode}</td>
                      <td className="p-3 text-slate-400">{m.examType}</td>
                      <td className="p-3 font-extrabold text-emerald-400">{m.marksObtained} / {m.maxMarks}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No marks published yet. Use the dropdown form to publish student grades.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
