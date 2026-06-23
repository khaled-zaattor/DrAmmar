import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AppointmentsList from './components/AppointmentsList';
import AppointmentForm from './components/AppointmentForm';
import BarbersList from './components/BarbersList';
import BarberForm from './components/BarberForm';
import ServicesList from './components/ServicesList';
import ServiceForm from './components/ServiceForm';
import ServiceCategoriesList from './components/ServiceCategoriesList';
import AvailabilityPage from './components/AvailabilityPage';
import UsersList from './components/UsersList';

// Redirect unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <span>Loading…</span>
      </div>
    );
  }
  return token ? children : <Navigate to="/login" replace />;
};

// Redirect non-admin users to / (appointments)
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Redirect authenticated users away from /login
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }
  return token ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<PublicRoute><Login /></PublicRoute>}
      />

      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        {/* Default landing page: today's appointments (works for both roles) */}
        <Route index element={<AppointmentsList />} />

        {/* Shared routes (both admin and barber) */}
        <Route path="appointments" element={<AppointmentsList />} />
        <Route path="appointments/:id/edit" element={<AppointmentForm />} />
        <Route path="availability" element={<AvailabilityPage />} />

        {/* Admin-only routes */}
        <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="barbers" element={<AdminRoute><BarbersList /></AdminRoute>} />
        <Route path="barbers/new" element={<AdminRoute><BarberForm /></AdminRoute>} />
        <Route path="barbers/:id/edit" element={<AdminRoute><BarberForm /></AdminRoute>} />
        <Route path="services" element={<AdminRoute><ServicesList /></AdminRoute>} />
        <Route path="services/new" element={<AdminRoute><ServiceForm /></AdminRoute>} />
        <Route path="services/:id/edit" element={<AdminRoute><ServiceForm /></AdminRoute>} />
        <Route path="service-categories" element={<AdminRoute><ServiceCategoriesList /></AdminRoute>} />
        <Route path="users" element={<AdminRoute><UsersList /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
