import { useEffect, useState } from "react";
import axios from "axios";
import LogOutButton from "../../components/LogOutButton";
import ClientNotificationsPanel from "../../components/ClientNotificationsPanel";
import { FaBell } from "react-icons/fa";
import ClientNotificationBell from "../../components/ClientNotificationsBell";
import Swal from "sweetalert2";
import DownloadEvaluatedRoutine from "./DownloadEvaluatedRoutine";
import EvaluationForm from "../../components/routinesComponents/EvaluationForm";
import SelfEvaluationForm from "../../components/routinesComponents/SelfEvaluationForm";
import RequestEvaluation from "../../components/routinesComponents/RequestEvaluation";

export default function MainProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ age: "", height: "", weight: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("perfil");
  const [user, setUser] = useState("");
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,

    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUser(localStorage.getItem("user"));
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
      .catch(() => setError("No se pudo cargar el perfil."));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:3000/users/update/${profile?.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Perfil actualizado correctamente.");
      setEditing(false);
      Toast.fire({
        icon: "success",
        title: "Cambios realizados exitosamente",
      }).then(() => {
        window.location.reload();
      });
    } catch {
      setError("Error al actualizar perfil.");
    }
  };

  if (error)
    return <div className="text-red-600 text-center mt-6">{error}</div>;
  if (!profile)
    return <div className="text-center mt-6">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Perfil de {profile.name}
        </h1>
        <div className="flex items-center gap-4">
          <div className="">
            <ClientNotificationBell user={user} />
          </div>
          <img src="/logo.png" alt="Gimnasio" className="h-10" />
          <LogOutButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        <button
          onClick={() => setTab("perfil")}
          className={`pb-2 border-b-2 ${
            tab === "perfil"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          } font-medium`}
        >
          Datos
        </button>
        <button
          onClick={() => setTab("rutinas")}
          className={`pb-2 border-b-2 ${
            tab === "rutinas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          } font-medium`}
        >
          Rutinas
        </button>
        <button
          onClick={() => setTab("evaluacion")}
          className={`pb-2 border-b-2 ${
            tab === "evaluacion"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          } font-medium`}
        >
          Evaluación
        </button>
      </div>

      {/* Paneles */}
      {tab === "perfil" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Edad:</strong> {profile.age ?? "No especificado"}
            </p>
            <p>
              <strong>Altura:</strong> {profile.height ?? "No especificado"} cm
            </p>
            <p>
              <strong>Peso:</strong> {profile.weight ?? "No especificado"} kg
            </p>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <input
                name="age"
                type="number"
                placeholder="Edad"
                value={formData.age}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                name="height"
                type="number"
                placeholder="Altura (cm)"
                value={formData.height}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                name="weight"
                type="number"
                placeholder="Peso (kg)"
                value={formData.weight}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Editar Información
            </button>
          )}
          {message && <p className="text-green-600">{message}</p>}
        </div>
      )}

      {tab === "rutinas" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Tus Rutinas
          </h3>
          <DownloadEvaluatedRoutine userId={profile.id} />
        </div>
      )}

      {tab === "evaluacion" && profile?.id && profile?.age && profile?.name ? (
        <RequestEvaluation userId={profile.id}>
          {(request) =>
            request.status === "aprobada" ? (
              <SelfEvaluationForm
                userId={profile.id}
                age={profile.age}
                name={profile.name}
                requestId={request.id}
              />
            ) : (
              <p className="text-sm text-yellow-600">
                Tu solicitud está pendiente de aprobación.
              </p>
            )
          }
        </RequestEvaluation>
      ) : (
        <p className="text-gray-500 text-sm">
          Para evaluar, necesitás tener edad y nombre cargado en tu perfil.
        </p>
      )}
    </div>
  );
}
