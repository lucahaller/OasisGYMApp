import { useEffect, useState } from "react";

export default function NotificationsPanel({ refresh }) {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/users/notifications");
      const data = await res.json(); // ahora siempre es array
      setNotifications(data);
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchNotifications();
    }
  }, [refresh]);

  //   const unreadCount = notifications.filter((n) => !n.read).length;
  console.log(notifications);

  return (
    <div className="relative">
      <button onClick={() => setShowList((prev) => !prev)} className="relative">
        🔔
        {/* {unreadCount > 0 && (
          <span className="absolute top-[-6px] right-[-6px] bg-red-600 text-white text-xs rounded-full px-2">
            {unreadCount}
          </span>
        )} */}
      </button>

      {showList && (
        <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md w-72 max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">No hay notificaciones</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b text-sm ${
                  n.read ? "bg-gray-50" : "bg-cyan-50"
                }`}
              >
                <strong>{n.user?.name || "Usuario"}:</strong> {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
