import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrips from "./pages/AdminTrips";
import AdminReports from "./pages/AdminReports";
import AdminTrucks from "./pages/AdminTrucks";
import AdminFreightBills from "./pages/AdminFreightB";
import AdminMaintenance from "./pages/AdminMaintenance";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute userType="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute userType="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips"
        element={
          <ProtectedRoute userType="admin">
            <AdminTrips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trucks"
        element={
          <ProtectedRoute userType="admin">
            <AdminTrucks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute userType="admin">
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/freights"
        element={
          <ProtectedRoute userType="admin">
            <AdminFreightBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/maintenance"
        element={
          <ProtectedRoute userType="admin">
            <AdminMaintenance />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
