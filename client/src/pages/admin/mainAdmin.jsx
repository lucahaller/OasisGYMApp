import axios from "axios";
import { useEffect, useState } from "react";
import UserDashboard from "./userDashboard";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../../components/RegisterModal";
import NotificationsPanel from "../../components/NotificationsPanel";

export default function MainAdmin() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState(null);
  const [showUser, setShowUser] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Nuevo estado para forzar refresco de notificaciones
  const [refreshNotifications, setRefreshNotifications] = useState(false);

  const handleRegister = async (formData) => {
    if (loading) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/users", formData);
      alert("Usuario registrado");
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data);
    } catch (error) {
      alert(
        "Error al crear usuario: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
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
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      });
  }, []);

  if (error)
    return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!profile)
    return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-gray-700">Dashboard Oasis</h1>
        <div className="flex items-center gap-4">
          <div className="relative text-gray-600">
            <input
              type="text"
              placeholder="Buscar..."
              className="border rounded-lg px-3 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <NotificationsPanel refresh={refreshNotifications} />
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
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Registrar Usuario
              </button>
            </div>

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
                    <th className="py-3  ">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 border-b">
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
                      <td className="py-3 px-4 ">
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            user.payment_status === "verde"
                              ? "border-green-600"
                              : user.payment_status === "amarillo"
                              ? "border-yellow-700"
                              : "border-red-600"
                          } ${
                            user.payment_status === "verde"
                              ? "bg-green-300"
                              : user.payment_status === "amarillo"
                              ? "bg-yellow-400"
                              : "bg-red-400"
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

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
      />
    </div>
  );
}
