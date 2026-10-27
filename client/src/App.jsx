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
import { AITutorChat } from './pages/AITutorChat';
import { ClassroomHub } from './pages/ClassroomHub';
import { AnalyticsHub } from './pages/AnalyticsHub';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { SolutionsHub } from './pages/SolutionsHub';
import { Settings } from './pages/Settings';
import { QuestionBankManager } from './pages/QuestionBankManager';
import { StyleGuide } from './pages/StyleGuide';
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

// Dynamic Dashboard based on User Role
const DashboardResolver = () => {
  const { role } = useContext(AuthContext);
  return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
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
              path="/tutor"
              element={
                <ProtectedRoute>
                  <AITutorChat />
                </ProtectedRoute>
              }
            />

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
