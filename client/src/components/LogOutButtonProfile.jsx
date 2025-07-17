import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function LogOutButtonProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="p-3 flex flex-row border-2 border-gray rounded-full hover:border-red-600 gap-3 items-center text-gray-600 hover:text-red-600 transition"
    >
      <FiLogOut className="text-xl" />
    </button>
  );
}
