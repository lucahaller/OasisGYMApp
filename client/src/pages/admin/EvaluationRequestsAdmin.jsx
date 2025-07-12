import axios from "axios";
import { useEffect, useState } from "react";

export default function EvaluationRequestsAdmin({ goBack }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://localhost:3000/evaluation-requests/user/0",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRequests(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar solicitudes", err);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:3000/evaluation-requests/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Solicitud aprobada");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error al aprobar solicitud", err);
      setMessage("Error al aprobar");
    }
  };

  if (loading) return <p className="text-sm">Cargando solicitudes...</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Solicitudes de Evaluación</h2>
        <button
          onClick={goBack}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-blue-400 text-white text-left text-sm uppercase font-semibold">
            <th className="py-3 px-4">Usuario</th>
            <th className="py-3 px-4">Estado</th>
            <th className="py-3 px-4">Acción</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">{req.user?.name || "Sin nombre"}</td>
              <td className="py-3 px-4">{req.status}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Aprobar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
