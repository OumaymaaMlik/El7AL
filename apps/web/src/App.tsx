import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { NotificationBridge } from './components/notifications/NotificationBridge';
import { NotificationToast } from './components/notifications/NotificationToast';

// Pages other than the first two load when they are opened, so the first visit downloads less.
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const ClientProfilePage = lazy(() =>
  import('./pages/ClientProfilePage').then((m) => ({ default: m.ClientProfilePage })),
);
const ClientHomePage = lazy(() => import('./pages/ClientHomePage').then((m) => ({ default: m.ClientHomePage })));
const ClientTrackingPage = lazy(() =>
  import('./pages/ClientTrackingPage').then((m) => ({ default: m.ClientTrackingPage })),
);
const ProviderHomePage = lazy(() => import('./pages/ProviderHomePage').then((m) => ({ default: m.ProviderHomePage })));
const ProviderTrackingPage = lazy(() =>
  import('./pages/ProviderTrackingPage').then((m) => ({ default: m.ProviderTrackingPage })),
);
const ProviderProfilePage = lazy(() =>
  import('./pages/ProviderProfilePage').then((m) => ({ default: m.ProviderProfilePage })),
);
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationBridge />
      <NotificationToast />

      <Suspense fallback={<div className="min-h-screen bg-light-bg dark:bg-dark-bg" />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Admin Login & Dedicated Dashboard Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/dashboard_admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard_admin" replace />} />
          <Route path="/admin/*" element={<Navigate to="/dashboard_admin" replace />} />

          {/* Client Routes */}
          <Route path="/client/home" element={<ClientHomePage />} />
          <Route path="/client/tracking" element={<ClientTrackingPage />} />
          <Route path="/client/profile" element={<ClientProfilePage />} />
          <Route path="/client/*" element={<Navigate to="/client/home" replace />} />

          {/* Provider Routes */}
          <Route path="/provider/home" element={<ProviderHomePage />} />
          <Route path="/provider/tracking" element={<ProviderTrackingPage />} />
          <Route path="/provider/profile" element={<ProviderProfilePage />} />
          <Route path="/provider/*" element={<Navigate to="/provider/home" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
