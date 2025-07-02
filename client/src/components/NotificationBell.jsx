import { useEffect, useState } from "react";
import NotificationsPanel from "./NotificationsPanel";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ count, refresh }) {
  const [showPanel, setShowPanel] = useState(false);

  const togglePanel = () => {
    setShowPanel((prev) => !prev);
  };

  return (
    <div className="relative">
      <button onClick={togglePanel} className="relative text-xl">
        <FaBell className="text-gray-700 hover:text-black" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {count}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationsPanel refresh={refresh} />
        </div>
      )}
    </div>
  );
}
