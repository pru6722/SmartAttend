import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/auth/Login';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { JoinSession } from './pages/student/JoinSession';
import { AttendanceHistory } from './pages/student/AttendanceHistory';
import { StudentExams } from './pages/student/StudentExams';
import { StudentProfile } from './pages/student/StudentProfile';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { CreateSession } from './pages/teacher/CreateSession';
import { LiveSession } from './pages/teacher/LiveSession';
import { TeacherReports } from './pages/teacher/TeacherReports';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageStudents } from './pages/admin/ManageStudents';
import { ManageTeachers } from './pages/admin/ManageTeachers';
import { ManageDepartments } from './pages/admin/ManageDepartments';
import { ManageTimetable } from './pages/admin/ManageTimetable';
import { ManageQueries } from './pages/admin/ManageQueries';
import { AuditLogs } from './pages/admin/AuditLogs';

const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRole?: string }> = ({ children, allowedRole }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/" element={<Login />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedLayout allowedRole="student"><StudentDashboard /></ProtectedLayout>} />
              <Route path="/student/join" element={<ProtectedLayout allowedRole="student"><JoinSession /></ProtectedLayout>} />
              <Route path="/student/history" element={<ProtectedLayout allowedRole="student"><AttendanceHistory /></ProtectedLayout>} />
              <Route path="/student/exams" element={<ProtectedLayout allowedRole="student"><StudentExams /></ProtectedLayout>} />
              <Route path="/student/profile" element={<ProtectedLayout allowedRole="student"><StudentProfile /></ProtectedLayout>} />

              {/* Teacher Routes */}
              <Route path="/teacher/dashboard" element={<ProtectedLayout allowedRole="teacher"><TeacherDashboard /></ProtectedLayout>} />
              <Route path="/teacher/session/create" element={<ProtectedLayout allowedRole="teacher"><CreateSession /></ProtectedLayout>} />
              <Route path="/teacher/session/live/:id" element={<ProtectedLayout allowedRole="teacher"><LiveSession /></ProtectedLayout>} />
              <Route path="/teacher/marks" element={<ProtectedLayout allowedRole="teacher"><TeacherMarks /></ProtectedLayout>} />
              <Route path="/teacher/reports" element={<ProtectedLayout allowedRole="teacher"><TeacherReports /></ProtectedLayout>} />
              <Route path="/teacher/profile" element={<ProtectedLayout allowedRole="teacher"><TeacherProfile /></ProtectedLayout>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedLayout allowedRole="admin"><AdminDashboard /></ProtectedLayout>} />
              <Route path="/admin/students" element={<ProtectedLayout allowedRole="admin"><ManageStudents /></ProtectedLayout>} />
              <Route path="/admin/teachers" element={<ProtectedLayout allowedRole="admin"><ManageTeachers /></ProtectedLayout>} />
              <Route path="/admin/timetables" element={<ProtectedLayout allowedRole="admin"><ManageTimetable /></ProtectedLayout>} />
              <Route path="/admin/queries" element={<ProtectedLayout allowedRole="admin"><ManageQueries /></ProtectedLayout>} />
              <Route path="/admin/departments" element={<ProtectedLayout allowedRole="admin"><ManageDepartments /></ProtectedLayout>} />
              <Route path="/admin/audit-logs" element={<ProtectedLayout allowedRole="admin"><AuditLogs /></ProtectedLayout>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
