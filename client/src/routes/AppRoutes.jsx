// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// import Login from "../pages/Login";
// import Perfil from "../pages/Perfil";
import Landing from "../pages/register&landing/Landing";
import MainProfile from "../pages/profile/mainProfile";
import RegisterLogin from "../pages/register&landing/RegisterLogin";

// import NotFound from "../pages/NotFound";
// import PrivateRoute from "./PrivateRoute"; // si querés rutas protegidas

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Landing />} />
      <Route path="/register" element={<Landing />} />
      <Route path="/profile" element={<MainProfile />} />
    </Routes>
  );
};

export default AppRoutes;
