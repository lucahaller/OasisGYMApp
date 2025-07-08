import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/PaymentModal";
import DeleteModal from "../../components/DeleteModal";
import { FaEdit } from "react-icons/fa";
import AssignRoutine from "../../components/routinesComponents/AssignRoutine";
import EvaluationForm from "../../components/routinesComponents/EvaluationForm";

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
        return "text-green-600";
      case "amarillo":
        return "text-yellow-500";
      case "rojo":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
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

      <div className="mb-6 flex flex-row">
        <div className="flex flex-col">
          <h2 className="text-4xl font-bold text-gray-800">{data.name}</h2>
          <p
            className={`text-base font-semibold mt-1 ${getStatusColor(
              data.payment_status
            )}`}
          >
            Estado de pago:{" "}
            {(data.payment_status === "verde" && "ACTIVO") ||
              (data.payment_status === "amarillo" && "ACTIVO (Vence pronto)") ||
              (data.payment_status === "rojo" && "INACTIVO (FALTA DE PAGO)")}
          </p>
        </div>

        <div className="flex flex-row ml-auto gap-10 py-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-3 rounded-sm transition"
          >
            Acreditar nuevo pago
          </button>
          <button
            onClick={() => setShowModalDelete(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-sm transition"
          >
            Eliminar usuario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DATOS PERSONALES */}
        <div className="bg-white border rounded-md p-6 shadow-sm text-[15px]">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Datos personales
            </h3>
            <button
              onClick={() => setEditingPersonalData(!editingPersonalData)}
              className="ml-auto text-gray-600 hover:text-lime-600 transition"
            >
              <FaEdit className="text-xl" />
            </button>
          </div>

          <ul className="space-y-2 text-gray-800">
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
                  className="w-full px-2 py-1 border rounded-sm"
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
                  className="w-full px-2 py-1 border rounded-sm"
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
                  className="w-full px-2 py-1 border rounded-sm"
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
                  className="w-full px-2 py-1 border rounded-sm"
                />
              ) : (
                data.injury || "Sin lesiones"
              )}
            </li>
          </ul>

          {editingPersonalData && (
            <button
              onClick={handleUserUpdate}
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-sm"
            >
              Guardar cambios
            </button>
          )}
        </div>

        {/* PAGOS */}
        <div className="bg-white border rounded-md p-6 shadow-sm text-[15px]">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Pagos</h3>
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
            <p className="text-lime-600 mt-2">
              <strong>Válido hasta:</strong>{" "}
              {format(new Date(data.payment_expiration), "dd/MM/yyyy")}
            </p>
          )}
        </div>

        {/* NOTAS */}
        <div className="bg-white border rounded-md p-6 shadow-sm text-[15px]">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Notas del usuario
            </h3>
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className="ml-auto text-gray-600 hover:text-lime-600 transition"
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
                className="w-full p-3 border rounded-sm text-gray-700 focus:ring-2 focus:ring-lime-400"
              />
              <button
                onClick={handleUserUpdate}
                className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-sm"
              >
                Guardar cambios
              </button>
            </>
          ) : (
            <p>{formData.notes || "Sin notas registradas"}</p>
          )}
        </div>
      </div>
      <div>
        <AssignRoutine userId={data.id} />
        <EvaluationForm userId={data.id} />
      </div>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
