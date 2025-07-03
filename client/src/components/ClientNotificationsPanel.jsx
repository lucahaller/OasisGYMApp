import { useEffect, useState } from "react";

export default function ClientNotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/client/mynotifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar notificaciones", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/client/mynotifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error al marcar como leída", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-panel">
      <h3>Notificaciones</h3>
      {notifications.length === 0 ? (
        <p>No hay notificaciones nuevas</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="notification-item">
            <p>{n.message}</p>
            <small>{new Date(n.date).toLocaleString()}</small>
            <button onClick={() => markAsRead(n.id)}>✖</button>
          </div>
        ))
      )}
    </div>
  );
}
