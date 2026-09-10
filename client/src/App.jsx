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
      {/* Landing Theme: Vibrant Glass & Energy */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Subpage Theme: Premium Glass & Geometry */}
      <Route element={<SubpageLayout />}>
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/icons/:slug" element={<IconDetailPage />} />
        <Route path="/packs/:slug" element={<PackDetailPage />} />
        <Route path="/editor" element={<IconEditorPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<InfoPage />} />
        <Route path="/contact" element={<InfoPage />} />
        <Route path="/whats-new" element={<InfoPage />} />
        <Route path="/terms" element={<InfoPage />} />
        <Route path="/privacy" element={<InfoPage />} />
        <Route path="/sitemap" element={<InfoPage />} />
        <Route path="/docs" element={<InfoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
