import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/PaymentModal";

export default function UserDashboard({ data, goBack }) {
  const [notes, setNotes] = useState(data.notes || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const handleNotesUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3000/users/update-notes/${data.id}`,
        { notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Notas actualizadas con éxito");
      setError("");
    } catch (err) {
      setMessage("");
      setError("Error al actualizar notas");
    }
  };

  return (
    <div className="p-20 bg-white  w-full mx-auto">
      {showModal && (
        <PaymentModal
          userId={data.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
      <button
        onClick={goBack}
        className="text-cyan-600 hover:underline mb-6 text-sm"
      >
        ← Volver al listado
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">{data.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
        <div>
          <p>
            <span className="font-semibold">Email:</span> {data.email}
          </p>
          <p>
            <span className="font-semibold">Edad:</span> {data.age ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Altura:</span>{" "}
            {data.height ? `${data.height} cm` : "-"}
          </p>
          <p>
            <span className="font-semibold">Lesión:</span>{" "}
            {data.injury ? `${data.injury} cm` : "Sin Lesiones"}
          </p>
          <p>
            <span className="font-semibold">Peso:</span>{" "}
            {data.weight ? `${data.weight} kg` : "-"}
          </p>
        </div>

        <div>
          <p>
            <span className="font-semibold">Ingreso al gimnasio:</span>{" "}
            {format(new Date(data.created_at), "dd/MM/yyyy")}
          </p>
          <p>
            <span className="font-semibold">Último pago:</span>{" "}
            {data.last_payment
              ? format(new Date(data.last_payment), "dd/MM/yyyy")
              : "Sin pago registrado"}
          </p>
          <p>
            <span className="font-semibold">Monto pagado:</span>{" "}
            {data.payment_amount ? `$${data.payment_amount}` : "-"}
          </p>
          {data.last_payment && (
            <p className="text-green-400 font-semibold">
              <span className="">Pago Válido hasta:</span>{" "}
              {format(new Date(data.payment_expiration), "dd/MM/yyyy")}
            </p>
          )}
        </div>
        <div className="">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Acreditar nuevo pago
          </button>
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-gray-800 font-semibold mb-2">
          Notas del usuario
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Notas adicionales..."
        />
        <button
          onClick={handleNotesUpdate}
          className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
        >
          Guardar notas
        </button>
        {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
