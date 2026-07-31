import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { UserPlus, Edit, Lock } from 'lucide-react';

export const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: 'Student@123',
    department: 'CSE',
    section: 'A',
    year: '3',
  });

  const fetchStudents = () => {
    apiClient.get('/admin/students')
      .then((res) => setStudents(res.data.students || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      rollNo: '',
      email: '',
      password: 'Student@123',
      department: 'CSE',
      section: 'A',
      year: '3',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (student: any) => {
    setIsEditing(true);
    setEditId(student._id);
    setFormData({
      name: student.name || '',
      rollNo: student.rollNo || '',
      email: student.email || '',
      password: '', // leave empty unless admin wants to overwrite
      department: student.department || 'CSE',
      section: student.section || 'A',
      year: String(student.year || '3'),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editId) {
        await apiClient.put(`/admin/students/${editId}`, formData);
      } else {
        await apiClient.post('/admin/students', formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save student record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Student Roster</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add, update, and manage student enrollments across academic departments.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition text-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Student Account
        </button>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Roll Number</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Facial Biometric</th>
                <th className="p-3.5">Primary Device</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.map((s) => {
                const hasFace = Boolean(s.faceTemplateReference && s.faceTemplateReference.length > 5);
                const hasDevice = Boolean(s.primaryDeviceHash && s.primaryDeviceHash.length > 5);

                return (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono text-sky-600 dark:text-sky-400 font-bold">{s.rollNo}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{s.email}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{s.department} (Sec {s.section})</td>
                    <td className="p-3.5">
                      {hasFace ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          ● Face Scan Enrolled
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          ⚠️ Pending Scan
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {hasDevice ? (
                        <span className="font-semibold text-sky-500">
                          📱 {s.primaryDeviceName || 'Registered Primary'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Device Registered</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1 ml-auto transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Student
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal Dialog for Adding / Editing Student */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {isEditing ? 'Edit Student Details' : 'Add New Student'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Roll No</label>
                  <input
                    type="text"
                    required
                    placeholder="21CS001"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@smartattend.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> {isEditing ? 'Overwrite Password (Optional)' : 'Student Password'}
                </label>
                <input
                  type="text"
                  placeholder={isEditing ? 'Leave empty to keep existing password' : 'Student@123'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-amber-600 dark:text-amber-300 font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow"
                >
                  {isEditing ? 'Update Student Record' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
