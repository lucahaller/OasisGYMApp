import axios from "axios";
import { useEffect, useState } from "react";
import UserDashboard from "./userDashboard";
import LogOutButton from "../../components/LogOutButton";
import { useNavigate } from "react-router-dom";
import ModalRegister from "../../components/ModalRegister";
import { useDispatch } from "react-redux";
import { register } from "../../actions/authActions";
import NotificationBell from "../../components/NotificationBell";

export default function MainAdmin() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState(null);
  const [showUser, setShowUser] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [refreshNotifications, setRefreshNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const handleRegister = async (formData) => {
    try {
      await dispatch(register(formData));
    } catch (err) {
      console.error("Error al registrar usuario", err);
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      });

    axios
      .get("http://localhost:3000/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        setError("No se pudo cargar los usuarios.");
      });

    // 🔔 Traer notificaciones automáticamente
    axios
      .get("http://localhost:3000/users/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  console.log(users);
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-gray-700">Dashboard Oasis</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar..."
            className="border rounded-lg px-3 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <NotificationBell count={count} refresh={refreshNotifications} />
        </div>
      </header>

      <main className="flex-1 px-6 py-4">
        {!showUser ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                Usuarios Registrados
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Registrar nuevo usuario
              </button>
            </div>

            <ModalRegister
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onRegister={handleRegister}
            />

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow">
                <thead>
                  <tr className="bg-sky-600 text-white text-left text-sm uppercase font-semibold">
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Edad</th>
                    <th className="py-3 px-4">Altura</th>
                    <th className="py-3 px-4">Peso</th>
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-100">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.age || "-"}</td>
                      <td className="py-3 px-4">
                        {user.height ? `${user.height} cm` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {user.weight ? `${user.weight} kg` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {user.last_payment
                          ? new Date(user.last_payment).toLocaleDateString(
                              "es-AR"
                            )
                          : "Sin pago"}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            user.payment_status === "verde"
                              ? "border-green-600 bg-green-300"
                              : user.payment_status === "amarillo"
                              ? "border-yellow-700 bg-yellow-400"
                              : "border-red-600 bg-red-400"
                          }`}
                        ></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}`)
                          }
                          className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-1 rounded"
                        >
                          Ver más
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

      <footer className="px-6 py-4 border-t">
        <LogOutButton />
      </footer>
    </div>
  );
}
