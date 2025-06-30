import { useEffect, useState } from "react";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/users/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
    }
  };
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/users/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error al marcar como leída", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="w-80 bg-white shadow-lg rounded-xl p-4 border border-gray-200 max-h-96 overflow-y-auto">
      <h2 className="text-base font-semibold mb-2">Notificaciones</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay notificaciones nuevas</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="flex justify-between items-start border-b py-2"
          >
            <div className="flex-1">
              <p className="text-sm">
                🔔{" "}
                {n.user?.name ? (
                  <a
                    href={`/admin/usuario/${n.user.id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {n.message}
                  </a>
                ) : (
                  n.message
                )}
              </p>
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
        ))
      )}
    </div>
  );
}
