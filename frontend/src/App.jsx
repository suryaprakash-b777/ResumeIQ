import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import TextAnalyzer from './pages/TextAnalyzer';
import ImageAnalyzer from './pages/ImageAnalyzer';
import CodeAnalyzer from './pages/CodeAnalyzer';
import DataAnalyzer from './pages/DataAnalyzer';
import GeneralAnalyzer from './pages/GeneralAnalyzer';
import History from './pages/History';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

// Layout wrapper for authenticated dashboard & analyzer tools
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FC] dark:bg-[#0F172A] transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {/* Fixed left sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-[260px] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            background: '#1E293B',
            color: '#fff',
            fontSize: '13px'
          }
        }}
      />

      <Routes>
        {/* Public Marketing & Auth Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard & Analyzers */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyzer/resume"
          element={
            <DashboardLayout>
              <ResumeAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/analyzer/text"
          element={
            <DashboardLayout>
              <TextAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/analyzer/image"
          element={
            <DashboardLayout>
              <ImageAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/analyzer/code"
          element={
            <DashboardLayout>
              <CodeAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/analyzer/data"
          element={
            <DashboardLayout>
              <DataAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/analyzer/general"
          element={
            <DashboardLayout>
              <GeneralAnalyzer />
            </DashboardLayout>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <History />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

