import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";

export default function ClientNotificationBell({ user }) {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/client/mynotifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const user = JSON.parse(localStorage.getItem("user")); // asegurate de tenerlo guardado así

      if (Array.isArray(data)) {
        const personalized = data.map((n) => {
          if (
            user?.role === "USER" &&
            n.message.includes(`El pago de ${user.name}`)
          ) {
            return {
              ...n,
              message: n.message.replace(`El pago de ${user.name}`, "Tu cuota"),
            };
          } else if (
            user?.role === "USER" &&
            n.message.includes(
              `Nuevo pago acreditado para el usuario ${user.name}`
            )
          ) {
            return {
              ...n,
              message: n.message.replace(
                `Nuevo pago acreditado para el usuario ${user.name}`,
                "Tu pago se acreditó correctamente"
              ),
            };
          }

          return n;
        });

        setNotifications(personalized);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error al obtener notificaciones", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/client/mynotifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualizar estado local
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error al marcar como leída", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  console.log(notifications);
  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel((prev) => !prev)}
        className="relative"
      >
        <FaBell className="text-gray-700 hover:text-black text-xl" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {notifications.length}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 z-50 bg-white border rounded shadow-lg w-80 max-h-96 overflow-y-auto p-4">
          <h2 className="text-base font-semibold mb-2">Tus notificaciones</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No tenés notificaciones</p>
          ) : (
            user &&
            notifications.map((n) => {
              const personalizedMessage =
                user?.role === "USER" &&
                n.message.includes(`El pago de ${user.name}`)
                  ? n.message.replace(`El pago de ${user.name}`, "Tu cuota")
                  : n.message;

              return (
                <div
                  key={n.id}
                  className="flex justify-between items-start border-b py-2"
                >
                  <div className="flex-1">
                    <p className="text-sm">{personalizedMessage}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(n.date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✖
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
