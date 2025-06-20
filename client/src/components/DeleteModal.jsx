import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function DeleteModal({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      setMessage("Usuario Eliminado");
      onSuccess(); // refresca la UI externa si lo deseás
      setTimeout(() => onClose(), 1500); // cierra el modal luego de mostrar éxito
    } catch (err) {
      console.error(err);
      setError("No se pudo acreditar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-500"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ¿Seguro que quieres eliminar este usuario? {}
        </h2>
        <div className="flex flex-row gap-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
          >
            {loading ? "Procesando..." : "Sí, eliminar"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
          >
            {loading ? "Procesando..." : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}
