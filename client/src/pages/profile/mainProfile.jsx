import { useEffect, useState } from "react";
import axios from "axios";
import LogOutButton from "../../components/LogOutButton";
import ClientNotificationBell from "../../components/ClientNotificationsBell";
import DownloadEvaluatedRoutine from "./DownloadEvaluatedRoutine";
import EvaluationForm from "../../components/routinesComponents/EvaluationForm";
import SelfEvaluationForm from "../../components/routinesComponents/SelfEvaluationForm";
import RequestEvaluation from "../../components/routinesComponents/RequestEvaluation";
import { FaEdit } from "react-icons/fa";
import { Switch } from "@headlessui/react";
import LogOutButtonProfile from "../../components/LogOutButtonProfile";
import useLastEvaluatedRoutines from "../../hooks/useLastEvaluatedRoutines";

export default function MainProfile() {
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ age: "", height: "", weight: "" });
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("perfil");

  useEffect(() => {
    const token = localStorage.getItem("token");
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
      });
  }, []);
  const { routines, loading: loadingRoutines } = useLastEvaluatedRoutines(
    profile?.id
  );
  console.log(routines);
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:3000/users/update/${profile?.id}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setEditing(false);
    window.location.reload();
  };

  if (!profile)
    return <div className="text-center mt-6">Cargando perfil...</div>;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Perfil de {profile.name}</h1>
          <div className="flex items-center gap-4">
            <ClientNotificationBell user={profile.name} />
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              className={`${darkMode ? "bg-blue-600" : "bg-gray-300"}
                relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Toggle Dark Mode</span>
              <span
                className={`${
                  darkMode ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>

            <LogOutButtonProfile />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-gray-700 mb-6">
          <div className="flex gap-4 text-sm font-medium">
            {["perfil", "rutinas", "evaluacion"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`pb-2 px-2 border-b-2 transition ${
                  tab === item
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sección PERFIL */}
        {tab === "perfil" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Información personal</h2>
              <button onClick={() => setEditing(!editing)}>
                <FaEdit className="text-gray-600 dark:text-gray-300 hover:text-blue-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Edad
                </label>
                {editing ? (
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="mt-1">{profile.age ?? "No especificado"}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Altura (cm)
                </label>
                {editing ? (
                  <input
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="mt-1">{profile.height ?? "No especificado"}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Peso (kg)
                </label>
                {editing ? (
                  <input
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="mt-1">{profile.weight ?? "No especificado"}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rutinas */}
        {tab === "rutinas" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Tus Rutinas Evaluadas
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cargando rutinas...
              </p>
            ) : routines.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aún no tenés rutinas evaluadas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 shadow-sm min-h-[220px] flex flex-col justify-between"
                  >
                    {/* Fecha arriba a la derecha */}
                    <p className="absolute top-3 right-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      {new Date(routine.createdAt).toLocaleDateString()}
                    </p>

                    {/* Contenido principal */}
                    <div className="pr-6 text-xl">
                      <p className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                        📄 Rutina:{" "}
                        <span className="font-semibold">
                          {routine.routine?.name || "Sin nombre"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
                        Días: {routine.routine?.days || "-"} días
                      </p>
                      <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
                        Tipo: {routine.routine?.type || "-"}
                      </p>

                      <span
                        className={`px-2 text-xs rounded ${
                          routine?.selfEvaluated
                            ? "bg-green-200"
                            : "bg-blue-200"
                        }`}
                      >
                        {routine?.selfEvaluated === true
                          ? "Autoevaluada"
                          : "Evaluada por Admin"}
                      </span>
                    </div>

                    <DownloadEvaluatedRoutine
                      userId={profile.id}
                      assignmentId={routine.id}
                      fileName={`${
                        routine.routine?.name || "rutina"
                      }-${new Date(
                        routine.updatedAt
                      ).toLocaleDateString()}.xlsx`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evaluación */}
        {tab === "evaluacion" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6">
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
          </div>
        )}

        {/* Logout al fondo */}
      </div>
    </div>
  );
}
