import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
// import Dashboard from "../pages/Dashboard";
// import AdminDashboard from "@/pages/AdminDashboard";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

// <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/admin/dashboard"
//   element={
//     <ProtectedRoute role="admin">
//       <AdminDashboard />
//     </ProtectedRoute>
//   }
// />
