import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { AppShell } from './components/layout/AppShell';

// Public & Landing Screens
import { LandingPage } from './pages/LandingPage';
import { AuthScreen } from './pages/AuthScreen';

// Core Capability & Adaptive Flow Screens
import { SubjectSelection } from './pages/SubjectSelection';
import { QuizInterface } from './pages/QuizInterface';
import { DiagnosticResults } from './pages/DiagnosticResults';
import { PracticeMode } from './pages/PracticeMode';
import { TestMode } from './pages/TestMode';
import { ReferenceLibrary } from './pages/ReferenceLibrary';
import { MyLearning } from './pages/MyLearning';
import { MyRevision } from './pages/MyRevision';
import { ClassroomHub } from './pages/ClassroomHub';
import { AnalyticsHub } from './pages/AnalyticsHub';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AssessmentBuilder } from './pages/AssessmentBuilder';
import { LiveTestCentre } from './pages/LiveTestCentre';
import { SubmissionsGrading } from './pages/SubmissionsGrading';
import { ClassResults } from './pages/ClassResults';
import { AttendanceManager } from './pages/AttendanceManager';
import { SchoolAdminDashboard } from './pages/SchoolAdminDashboard';
import { SolutionsHub } from './pages/SolutionsHub';
import { Settings } from './pages/Settings';
import { QuestionBankManager } from './pages/QuestionBankManager';
import { StyleGuide } from './pages/StyleGuide';
import { ContactSupportPage } from './pages/ContactSupportPage';
import { ParentPortal } from './pages/ParentPortal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Protected App Shell Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

// Dynamic Dashboard based on User Role (Admin, Teacher, Parent, Student)
const DashboardResolver = () => {
  const { role } = useContext(AuthContext);
  if (role === 'admin' || role === 'school_admin') return <SchoolAdminDashboard />;
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'parent') return <ParentPortal />;
  return <StudentDashboard />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
            <Routes>
            {/* 1. Public Landing Page (Public Top Navigation) */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <LandingPage />
                </>
              }
            />

            {/* Public Help, Contact, Feedback & Bug Report Pages */}
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <ContactSupportPage />
                </>
              }
            />
            <Route
              path="/support"
              element={
                <>
                  <Navbar />
                  <ContactSupportPage />
                </>
              }
            />
            <Route
              path="/feedback"
              element={
                <>
                  <Navbar />
                  <ContactSupportPage />
                </>
              }
            />

            {/* 2. Authentication Screens (Clean Split-Screen Layout) */}
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/register" element={<AuthScreen />} />

            {/* 3. Authenticated Workspace (Wrapped in AppShell with Persistent Sidebar) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardResolver />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Teacher Command Centre Dedicated Workspaces */}
            <Route path="/teacher-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/teacher/assessments"
              element={
                <ProtectedRoute>
                  <AssessmentBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/builder"
              element={
                <ProtectedRoute>
                  <AssessmentBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/live-test"
              element={
                <ProtectedRoute>
                  <LiveTestCentre />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/grading"
              element={
                <ProtectedRoute>
                  <SubmissionsGrading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/results"
              element={
                <ProtectedRoute>
                  <ClassResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/reports"
              element={
                <ProtectedRoute>
                  <ClassResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <SchoolAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/school-admin"
              element={
                <ProtectedRoute>
                  <SchoolAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent"
              element={
                <ProtectedRoute>
                  <ParentPortal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/select"
              element={
                <ProtectedRoute>
                  <SubjectSelection />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pre-test"
              element={
                <ProtectedRoute>
                  <QuizInterface />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <DiagnosticResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticeMode />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <TestMode />
                </ProtectedRoute>
              }
            />

            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <ReferenceLibrary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              }
            />

            <Route path="/revision" element={<Navigate to="/my-learning" replace />} />

            <Route path="/achievements" element={<Navigate to="/metrics" replace />} />

            {/* Seamless redirects for legacy decommissioned AI routes */}
            <Route path="/tutor" element={<Navigate to="/my-learning" replace />} />
            <Route path="/ai-hub" element={<Navigate to="/revision" replace />} />

            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <ClassroomHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/metrics"
              element={
                <ProtectedRoute>
                  <AnalyticsHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <AnalyticsHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/solutions"
              element={
                <ProtectedRoute>
                  <SolutionsHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/question-bank"
              element={
                <ProtectedRoute>
                  <QuestionBankManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Design System & Living Component Library */}
            <Route
              path="/styleguide"
              element={
                <ProtectedRoute>
                  <StyleGuide />
                </ProtectedRoute>
              }
            />

            {/* Post-test alias redirecting to Test Mode */}
            <Route
              path="/post-test"
              element={
                <ProtectedRoute>
                  <TestMode />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </ErrorBoundary>
    </AuthProvider>
  </ThemeProvider>
);
};

export default App;
