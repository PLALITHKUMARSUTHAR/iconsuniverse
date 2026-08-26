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
import ContributorDashboard from './pages/ContributorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserProfilePage from './pages/UserProfilePage';
import InfoPage from './pages/InfoPage';
import NotFoundPage from './pages/NotFoundPage';

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
        <Route path="/contributor" element={<ContributorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
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
