// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

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
      {/* Landing / Login / Register accesibles solo si NO está logueado */}
      <Route
        path="/"
        element={
          <LoginGuard>
            <Landing />
          </LoginGuard>
        }
      />
      <Route
        path="/login"
        element={
          <LoginGuard>
            <Landing />
          </LoginGuard>
        }
      />
      <Route
        path="/register"
        element={
          <LoginGuard>
            <Landing />
          </LoginGuard>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/profile"
        element={
          <AuthGuard roleAllowed={["USER", "ADMIN"]}>
            <MainProfile />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthGuard roleAllowed={["ADMIN"]}>
            <MainAdmin />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/users/:id"
        element={
          <AuthGuard roleAllowed={["ADMIN"]}>
            <UserDetailPage />
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
