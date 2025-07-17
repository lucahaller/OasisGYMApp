import axios from "axios";
import { useEffect, useState } from "react";
import UserDashboard from "./userDashboard";
import LogOutButton from "../../components/LogOutButton";
import { useNavigate } from "react-router-dom";
import ModalRegister from "../../components/ModalRegister";
import { useDispatch } from "react-redux";
import { register } from "../../actions/authActions";
import NotificationBell from "../../components/NotificationBell";
import EvaluationRequestsAdmin from "./EvaluationRequestsAdmin";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";

export default function MainAdmin() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState(null);
  const [showUser, setShowUser] = useState(false);
  const [user, setUser] = useState(null);
  const [showEvaluationRequests, setShowEvaluationRequests] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [refreshNotifications, setRefreshNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  const handleRegister = async (formData) => {
    try {
      console.log("Datos enviados para registrar:", formData);
      await dispatch(register(formData));
      console.log("Registro exitoso");
    } catch (err) {
      console.error("Error al registrar usuario", err);
      throw err; // Importante: re-lanzar error para que el modal lo capture
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay token. Iniciá sesión.");
      return;
    }

    axios
      .get("http://localhost:3000/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      });

    axios
      .get("http://localhost:3000/users/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        setError("No se pudo cargar los usuarios.");
      });

    axios
      .get("http://localhost:3000/users/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(Array.isArray(res.data) ? res.data : []);
        setCount(res.data.length);
      })
      .catch((err) => {
        console.error("Error al obtener notificaciones:", err);
      });
  }, []);

  if (error)
    return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!profile)
    return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard Oasis
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="text-gray-600 dark:text-yellow-300 hover:scale-110 transition-transform"
            title="Cambiar modo"
          >
            {darkMode ? <BsSunFill size={20} /> : <BsMoonStarsFill size={20} />}
          </button>
          <NotificationBell count={count} refresh={refreshNotifications} />
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        {showEvaluationRequests ? (
          <EvaluationRequestsAdmin
            goBack={() => setShowEvaluationRequests(false)}
          />
        ) : !showUser ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition duration-150"
                >
                  + Registrar usuario
                </button>
                <button
                  onClick={() => setShowEvaluationRequests(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition duration-150"
                >
                  📋 Ver peticiones de evaluación
                </button>
              </div>
            </div>

            <ModalRegister
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onRegister={handleRegister}
            />

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-300">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Edad</th>
                    <th className="px-6 py-3">Altura</th>
                    <th className="px-6 py-3">Peso</th>
                    <th className="px-6 py-3">Último pago</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr
                      key={user.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.age || "-"}</td>
                      <td className="px-6 py-4">
                        {user.height ? `${user.height} cm` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {user.weight ? `${user.weight} kg` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {user.last_payment
                          ? new Date(user.last_payment).toLocaleDateString(
                              "es-AR"
                            )
                          : "Sin pago"}
                      </td>
                      <td className="px-6 py-4 flex flex-row gap-2 items-center">
                        <div
                          className={`w-3 h-3 rounded-full inline-block ${
                            user.payment_status === "verde"
                              ? "bg-green-400"
                              : user.payment_status === "amarillo"
                              ? "bg-yellow-400"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="inline-block">
                          {user.payment_status === "verde"
                            ? "Activo"
                            : user.payment_status === "Amarillo"
                            ? "Activo (Pronto a vencer)"
                            : "Inactivo"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}`)
                          }
                          className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                        >
                          Ver usuario
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <UserDashboard
            data={user}
            goBack={() => navigate("/dashboard")}
            setRefreshNotifications={setRefreshNotifications}
          />
        )}
      </main>

      <footer className="px-6 py-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <LogOutButton />
      </footer>
    </div>
  );
}
