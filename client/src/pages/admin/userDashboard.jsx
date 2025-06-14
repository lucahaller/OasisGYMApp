import axios from "axios";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ age: "", height: "", weight: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay token. Iniciá sesión.");
      return;
    }

    axios
      .get("http://localhost:3000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data.user);
        setFormData({
          age: res.data.user.age || "",
          height: res.data.user.height || "",
          weight: res.data.user.weight || "",
        });
      })
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      });
  }, []);

  return (
    <div className="p-6">
      <div className="text-2xl text-black"> {profile?.name}</div>
    </div>
  );
}
