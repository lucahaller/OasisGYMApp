import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/PaymentModal";
import DeleteModal from "../../components/DeleteModal";

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
  const [editing, setEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(data.id);
    setFormData({ ...formData, [name]: value });
  };

  const handleUserUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/users/update/${data.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Datos actualizados con éxito");
      setError("");
      setEditing(false);
      window.location.reload();
    } catch (err) {
      setMessage("");
      setError("Error al actualizar los datos");
    }
  };
  console.log(data);
  return (
    <div className="p-20 bg-white w-full mx-auto">
      {showModal && (
        <PaymentModal
          userId={data.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
      {showModalDelete && (
        <DeleteModal
          userId={data.id}
          onClose={() => setShowModalDelete(false)}
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
            <span className="font-semibold">Edad:</span>{" "}
            {editing ? (
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : (
              data.age || "Edad no especificada"
            )}
          </p>
          <p>
            <span className="font-semibold">Altura:</span>{" "}
            {editing ? (
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : data.height ? (
              `${data.height} cm`
            ) : (
              "Altura no especificada"
            )}
          </p>
          <p>
            <span className="font-semibold">Lesión:</span>{" "}
            {editing ? (
              <input
                type="text"
                name="injury"
                value={formData.injury}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : (
              data.injury || "Sin lesiones registradas"
            )}
          </p>
          <p>
            <span className="font-semibold">Peso:</span>{" "}
            {editing ? (
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : data.weight ? (
              `${data.weight} kg`
            ) : (
              "Peso no especificado"
            )}
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

        <div className="flex flex-col gap-6 w-fit">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Acreditar nuevo pago
          </button>
          <button
            onClick={() => setShowModalDelete(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Eliminar usuario
          </button>
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-gray-800 font-semibold mb-2">
          Notas del usuario
        </label>
        {editing ? (
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Notas adicionales..."
          />
        ) : (
          <p>{formData.notes || "Sin notas registradas"}</p>
        )}

        <div className="mt-3 flex gap-4">
          {editing ? (
            <button
              onClick={handleUserUpdate}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
            >
              Guardar cambios
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
            >
              Editar datos
            </button>
          )}
        </div>
        {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
