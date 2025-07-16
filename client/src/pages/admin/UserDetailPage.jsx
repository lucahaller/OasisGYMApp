import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import UserDashboard from "./userDashboard"; // Asegurate que el path sea correcto

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:3000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error al obtener usuario:", err);
      setError("No se pudo cargar el usuario");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-lime-600 hover:underline text-base font-medium"
        >
          ← Volver al dashboard
        </button>
        <p className="mt-4 text-red-500">{error}</p>
      </div>
    );
  }

  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
        Cargando usuario...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <UserDashboard data={user} goBack={() => navigate("/dashboard")} />
    </div>
  );
}
