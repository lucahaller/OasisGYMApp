import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function PaymentModal({ userId, onClose, onSuccess }) {
  const [months, setMonths] = useState(1);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!months || !amount) {
      setError("Completa ambos campos.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/users/pay/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ months, amount }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al acreditar el pago.");
      }

      setMessage("Pago acreditado con éxito.");
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
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Acreditar pago</h2>

        <label className="block mb-2 text-gray-700 font-medium">
          Meses abonados:
        </label>
        <input
          type="number"
          min={1}
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4"
        />

        <label className="block mb-2 text-gray-700 font-medium">
          Monto abonado (ARS):
        </label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-2">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded"
        >
          {loading ? "Procesando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
