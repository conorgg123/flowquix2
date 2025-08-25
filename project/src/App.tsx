import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeProvider';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/tasks/TaskList';
import { ProjectList } from './components/projects/ProjectList';
import { Calendar } from './components/calendar/Calendar';
import { FileList } from './components/files/FileList';
import { Chat } from './components/chat/Chat';
import { TimeTracker } from './components/time/TimeTracker';
import { AssetManager } from './components/assets/AssetManager';
import { AchievementCenter } from './components/achievements/AchievementCenter';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsPage } from './components/settings/SettingsPage';
import { TeamDashboard } from './components/team/TeamDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { SupportPage } from './components/support/SupportPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/files" element={<FileList />} />
            <Route path="/messages" element={<Chat />} />
            <Route path="/time" element={<TimeTracker />} />
            <Route path="/assets" element={<AssetManager />} />
            <Route path="/achievements" element={<AchievementCenter />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/team" element={<TeamDashboard />} />
            <Route path="/support" element={<SupportPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}