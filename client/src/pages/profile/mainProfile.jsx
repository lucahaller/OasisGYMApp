import { useEffect, useState } from "react";
import axios from "axios";

export default function MainProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay token. Iniciá sesión.");
      return;
    }

    axios
      .get("http://localhost:3000/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      });
  }, []);

  if (error) return <div className="text-red-600 text-center">{error}</div>;

  if (!profile) return <div className="text-center">Cargando perfil...</div>;

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow text-black">
        <h2 className="text-2xl font-bold mb-2">Perfil de Usuario</h2>
        <p>
          <strong>Nombre:</strong> {profile.user.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.user.email}
        </p>
      </div>
    </div>
  );
}
