// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/register&landing/Landing";
import MainProfile from "../pages/profile/mainProfile";
import RegisterLogin from "../pages/register&landing/RegisterLogin";
import MainAdmin from "../pages/admin/mainAdmin";
import LoginGuard from "../middleware/LoginGuard";
import AuthGuard from "../middleware/AuthGuard";
import UserDashboard from "../pages/admin/userDashboard";
import UserDetailPage from "../pages/admin/UserDetailPage";

// Protección de rutas
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={<MainProfile />} />
      <Route path="/dashboard" element={<MainAdmin />} />
      <Route path="/dashboard/users/:id" element={<UserDetailPage />} />
    </Routes>
  );
};

export default AppRoutes;
