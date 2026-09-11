import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTickets from './pages/customer/CustomerTickets';
import CreateTicket from './pages/customer/CreateTicket';
import CustomerTicketDetail from './pages/customer/CustomerTicketDetail';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import CustomerProfile from './pages/customer/CustomerProfile';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTickets from './pages/agent/AgentTickets';
import AgentTicketDetail from './pages/agent/AgentTicketDetail';
import AgentEscalations from './pages/agent/AgentEscalations';
import AgentProfile from './pages/agent/AgentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAIActivity from './pages/admin/AdminAIActivity';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminKnowledge from './pages/admin/AdminKnowledge';
import AdminRecurringIssues from './pages/admin/AdminRecurringIssues';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'SUPPORT_AGENT') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="tickets" element={<CustomerTickets />} />
        <Route path="tickets/new" element={<CreateTicket />} />
        <Route path="tickets/:id" element={<CustomerTicketDetail />} />
        <Route path="feedback" element={<CustomerFeedback />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Support Agent Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['SUPPORT_AGENT', 'ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="tickets" element={<AgentTickets />} />
        <Route path="tickets/:id" element={<AgentTicketDetail />} />
        <Route path="escalations" element={<AgentEscalations />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ai-activity" element={<AdminAIActivity />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="knowledge" element={<AdminKnowledge />} />
        <Route path="recurring-issues" element={<AdminRecurringIssues />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
