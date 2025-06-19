import { useEffect, useState } from "react";
import axios from "axios";
import LogOutButton from "../../components/LogOutButton";

export default function MainProfile() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:3000/users/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Perfil actualizado correctamente.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar perfil.");
    }
  };

  if (error)
    return <div className="text-red-600 text-center mt-6">{error}</div>;
  if (!profile)
    return <div className="text-center mt-6">Cargando perfil...</div>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Perfil de Usuario
        </h2>
        <div className="space-y-2">
          <p>
            <strong>Nombre:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Información Física
          </h3>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Edad</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p>
                <strong>Edad:</strong> {profile.age ?? "No especificado"}
              </p>
              <p>
                <strong>Altura:</strong> {profile.height ?? "No especificado"}{" "}
                cm
              </p>
              <p>
                <strong>Peso:</strong> {profile.weight ?? "No especificado"} kg
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Editar Información
              </button>
            </div>
          )}
        </div>
        <LogOutButton />
        {message && <div className="text-green-600 mt-4">{message}</div>}
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>

      {/* Placeholder para rutinas */}
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tus Rutinas</h3>
        <p className="text-gray-600">
          Próximamente podrás ver tus rutinas asignadas.
        </p>
      </div>

      {/* Placeholder para evaluación */}
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 mt-6 mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Evaluación de Rutinas
        </h3>
        <p className="text-gray-600">
          Aquí podrás evaluar tu progreso una vez tengas rutinas.
        </p>
      </div>
    </div>
  );
}
