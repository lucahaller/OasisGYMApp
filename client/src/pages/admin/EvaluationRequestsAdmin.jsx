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
          "http://localhost:3000/evaluationrequests/user/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRequests(res.data.filter((req) => req.status === "pendiente"));
      } catch (err) {
        console.error("Error al cargar solicitudes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:3000/evaluationrequests/${id}/approve`,
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

  if (loading)
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Cargando solicitudes...
      </p>
    );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Solicitudes de Evaluación
        </h2>
        <button
          onClick={goBack}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-1 rounded border border-transparent hover:border-gray-400 transition"
          aria-label="Volver"
          type="button"
        >
          ← Volver
        </button>
      </div>

      {message && (
        <p className="mb-4 text-center text-green-600 dark:text-green-400 font-medium">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-blue-600 dark:bg-blue-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400"
                >
                  No hay solicitudes pendientes.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {req.user?.name || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 capitalize">
                    {req.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition"
                    >
                      Aprobar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
