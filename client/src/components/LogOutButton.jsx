import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function LogOutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="p-3 flex flex-row gap-3 items-center text-gray-600 hover:text-red-600 transition"
    >
      <FiLogOut className="text-xl" />
      Cerrar Sesión
    </button>
  );
}
