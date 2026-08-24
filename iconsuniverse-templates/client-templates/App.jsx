import { Routes, Route } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import SubpageLayout from './layouts/SubpageLayout';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import IconDetailPage from './pages/IconDetailPage';
import PackDetailPage from './pages/PackDetailPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Landing page — "Vibrant Glass & Energy" theme */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* All other pages — "Premium Glass & Geometry" theme */}
      <Route element={<SubpageLayout />}>
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/icons/:slug" element={<IconDetailPage />} />
        <Route path="/packs/:slug" element={<PackDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
