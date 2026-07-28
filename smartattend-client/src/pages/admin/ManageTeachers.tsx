import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { UserPlus, Edit, Lock, AlertCircle } from 'lucide-react';

export const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'CSE',
    password: 'Teacher@123',
  });

  const fetchTeachers = () => {
    apiClient.get('/admin/teachers')
      .then((res) => setTeachers(res.data.teachers || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setErrorMsg('');
    setFormData({
      name: '',
      email: '',
      department: 'CSE',
      password: 'Teacher@123',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (teacher: any) => {
    setIsEditing(true);
    setEditId(teacher._id);
    setErrorMsg('');
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      department: teacher.department || 'CSE',
      password: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isEditing && editId) {
        await apiClient.put(`/admin/teachers/${editId}`, formData);
      } else {
        await apiClient.post('/admin/teachers', formData);
      }
      setShowModal(false);
      fetchTeachers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save teacher record. Make sure email is unique.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Teachers Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage teaching staff accounts and assign academic course sessions.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition text-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Teacher Account
        </button>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {teachers.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{t.email}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{t.department || 'CSE'}</td>
                  <td className="p-3.5 uppercase text-xs font-bold text-sky-600 dark:text-sky-400">Teacher</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1 ml-auto transition"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Teacher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal Dialog for Adding / Editing Teacher */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {isEditing ? 'Edit Teacher Details' : 'Add Teacher Account'}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@smartattend.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> {isEditing ? 'Overwrite Password (Optional)' : 'Teacher Login Password'}
                </label>
                <input
                  type="text"
                  placeholder={isEditing ? 'Leave empty to keep existing password' : 'Teacher@123'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-amber-600 dark:text-amber-300 font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow"
                >
                  {isEditing ? 'Update Teacher Record' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
