import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/PaymentModal";
import DeleteModal from "../../components/DeleteModal";
import { FaEdit } from "react-icons/fa";
import AssignRoutine from "../../components/routinesComponents/AssignRoutine";
import EvaluationForm from "../../components/routinesComponents/EvaluationForm";
import UserRoutineFlow from "../../components/routinesComponents/UserRoutineFlow";

export default function UserDashboard({ data, goBack }) {
  const [formData, setFormData] = useState({
    notes: data.notes || "",
    age: data.age || "",
    height: data.height || "",
    weight: data.weight || "",
    injury: data.injury || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);

  const [editingPersonalData, setEditingPersonalData] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/users/update/${data.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Datos actualizados con éxito");
      setError("");
      setEditingPersonalData(false);
      setEditingNotes(false);
      window.location.reload();
    } catch (err) {
      setMessage("");
      setError("Error al actualizar los datos");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verde":
        return "text-green-500";
      case "amarillo":
        return "text-yellow-500";
      case "rojo":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto text-gray-800 dark:text-gray-200">
      {showModal && (
        <PaymentModal
          userId={data.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
      {showModalDelete && (
        <DeleteModal
          userId={data.id}
          onClose={() => setShowModalDelete(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      <button
        onClick={goBack}
        className="text-lime-600 hover:underline text-base font-medium mb-4"
      >
        ← Volver al listado
      </button>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            {data.name}
          </h2>
          <p
            className={`text-base font-semibold mt-2 ${getStatusColor(
              data.payment_status
            )}`}
          >
            Estado de pago:{" "}
            {(data.payment_status === "verde" && "ACTIVO") ||
              (data.payment_status === "amarillo" && "ACTIVO (Vence pronto)") ||
              (data.payment_status === "rojo" && "INACTIVO (FALTA DE PAGO)")}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            💰 Acreditar pago
          </button>
          <button
            onClick={() => setShowModalDelete(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            🗑️ Eliminar usuario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Datos personales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">📋 Datos personales</h3>
            <button
              onClick={() => setEditingPersonalData(!editingPersonalData)}
              className="ml-auto text-gray-500 hover:text-lime-500 transition"
            >
              <FaEdit className="text-xl" />
            </button>
          </div>

          <ul className="space-y-2">
            <li>
              <strong>Email:</strong> {data.email}
            </li>
            <li>
              <strong>Edad:</strong>{" "}
              {editingPersonalData ? (
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border"
                />
              ) : (
                data.age || "No especificada"
              )}
            </li>
            <li>
              <strong>Altura:</strong>{" "}
              {editingPersonalData ? (
                <input
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border"
                />
              ) : data.height ? (
                `${data.height} cm`
              ) : (
                "No especificada"
              )}
            </li>
            <li>
              <strong>Peso:</strong>{" "}
              {editingPersonalData ? (
                <input
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border"
                />
              ) : data.weight ? (
                `${data.weight} kg`
              ) : (
                "No especificado"
              )}
            </li>
            <li>
              <strong>Lesión:</strong>{" "}
              {editingPersonalData ? (
                <input
                  name="injury"
                  value={formData.injury}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border"
                />
              ) : (
                data.injury || "Sin lesiones"
              )}
            </li>
          </ul>

          {editingPersonalData && (
            <button
              onClick={handleUserUpdate}
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg"
            >
              Guardar cambios
            </button>
          )}
        </div>

        {/* Pagos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">💳 Pagos</h3>
          <p>
            <strong>Ingreso:</strong>{" "}
            {format(new Date(data.created_at), "dd/MM/yyyy")}
          </p>
          <p>
            <strong>Último pago:</strong>{" "}
            {data.last_payment
              ? format(new Date(data.last_payment), "dd/MM/yyyy")
              : "Sin registro"}
          </p>
          <p>
            <strong>Monto pagado:</strong>{" "}
            {data.payment_amount ? `$${data.payment_amount}` : "-"}
          </p>
          {data.payment_expiration && (
            <p className="text-lime-500 mt-2">
              <strong>Válido hasta:</strong>{" "}
              {format(new Date(data.payment_expiration), "dd/MM/yyyy")}
            </p>
          )}
        </div>

        {/* Notas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">📝 Notas del usuario</h3>
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className="ml-auto text-gray-500 hover:text-lime-500 transition"
            >
              <FaEdit className="text-xl" />
            </button>
          </div>

          {editingNotes ? (
            <>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-lg text-sm"
              />
              <button
                onClick={handleUserUpdate}
                className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg"
              >
                Guardar cambios
              </button>
            </>
          ) : (
            <p>{formData.notes || "Sin notas registradas"}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <UserRoutineFlow
          userId={data.id}
          paymentStatus={data.payment_status}
          name={data?.name}
          age={data.age}
        />
      </div>

      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
