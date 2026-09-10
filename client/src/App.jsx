import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import SubpageLayout from './layouts/SubpageLayout';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import IconDetailPage from './pages/IconDetailPage';
import PackDetailPage from './pages/PackDetailPage';
import IconEditorPage from './pages/IconEditorPage';
import PricingPage from './pages/PricingPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserProfilePage from './pages/UserProfilePage';
import InfoPage from './pages/InfoPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Landing Theme: Vibrant Glass & Energy (Protected - requires sign-up/login) */}
      <Route element={<LandingLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Subpage Theme: Premium Glass & Geometry */}
      <Route element={<SubpageLayout />}>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<InfoPage />} />
        <Route path="/privacy" element={<InfoPage />} />

        {/* Protected App Content Routes (Requires Sign-up or Login) */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/icons/:slug"
          element={
            <ProtectedRoute>
              <IconDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packs/:slug"
          element={
            <ProtectedRoute>
              <PackDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <IconEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whats-new"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docs"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
