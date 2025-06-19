import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthGuard({ children, roleAllowed }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return navigate("/login");
    }

    axios
      .get("http://localhost:3000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const role = res.data.user.role;

        // Verifica si el rol tiene acceso a esta ruta
        if (!roleAllowed.includes(role)) {
          return navigate("/unauthorized");
        }

        setAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;
  return authorized ? children : null;
}
