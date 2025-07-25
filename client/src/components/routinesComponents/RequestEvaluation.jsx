import axios from "axios";
import { useEffect, useState } from "react";

export default function RequestEvaluation({ userId, children }) {
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequestStatus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/evaluationrequests/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.length > 0) setRequest(res.data[0]); // solo tomamos la más reciente
    } catch (err) {
      console.error("No hay solicitud aún");
    }
  };

  const handleRequest = async () => {
    try {
      await axios.post(
        `http://localhost:3000/evaluationrequests`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Solicitud enviada. Esperando aprobación.");
      fetchRequestStatus();
    } catch (err) {
      console.error("Error al solicitar evaluación", err);
      setMessage("Error al enviar la solicitud");
    }
  };

  useEffect(() => {
    fetchRequestStatus();
  }, []);
  console.log(request);
  if (!request) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Aún no solicitaste una evaluación. Hacelo con el botón de abajo.
        </p>
        <button
          onClick={handleRequest}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Solicitar Evaluación
        </button>
        {message && <p className="text-sm text-gray-800">{message}</p>}
      </div>
    );
  }

  return <div>{children(request)}</div>;
}
