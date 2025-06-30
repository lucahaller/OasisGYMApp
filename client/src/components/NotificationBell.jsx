import { useState } from "react";
import NotificationsPanel from "./NotificationsPanel";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ refresh }) {
  const [showPanel, setShowPanel] = useState(false);

  const togglePanel = () => {
    setShowPanel((prev) => !prev);
  };

  return (
    <div className="relative">
      <button onClick={togglePanel} className="relative text-xl">
        <FaBell className="text-gray-700 hover:text-black" />
        {/* Puedes agregar un punto rojo si hay nuevas notificaciones */}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationsPanel refresh={refresh} />
        </div>
      )}
    </div>
  );
}
