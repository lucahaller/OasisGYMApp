import { useEffect, useState } from "react";
import axios from "axios";
import AssignRoutine from "./AssignRoutine";
import EvaluationForm from "./EvaluationForm";
import DownloadEvaluatedRoutine from "../../pages/profile/DownloadEvaluatedRoutine";

export default function UserRoutineFlow({ userId, paymentStatus, name, age }) {
  const [estado, setEstado] = useState("loading");
  const [showAssign, setShowAssign] = useState(false);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [evaluatedRoutines, setEvaluatedRoutines] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/routines/user/${userId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEstado(res.data.status);
      } catch {
        setEstado("no-assigned");
      }
    };

    fetchEstado();
  }, [userId, showAssign, showEvaluate]);

  useEffect(() => {
    if (estado === "evaluated") {
      const fetchEvaluated = async () => {
        const res = await axios.get(
          `http://localhost:3000/routines/user/${userId}/evaluated/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvaluatedRoutines(res.data);
      };
      fetchEvaluated();
    }
  }, [estado]);

  if (estado === "loading")
    return <p className="text-sm">Cargando rutina...</p>;

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      {/* Si no hay rutina asignada */}
      {estado === "no-assigned" && (
        <>
          <p className="mb-3">El usuario no tiene una rutina asignada.</p>
          {paymentStatus === "verde" ? (
            !showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-sm"
              >
                Asignar rutina
              </button>
            ) : (
              <AssignRoutine userId={userId} setShowAssign={setShowAssign} />
            )
          ) : (
            <p className="text-red-600 text-sm">
              El usuario no tiene el pago al día. No se puede asignar rutina.
            </p>
          )}
        </>
      )}

      {/* Rutina asignada pero sin evaluar */}
      {estado === "assigned" && !showEvaluate && (
        <>
          <p className="mb-3">
            El usuario tiene una rutina pendiente de evaluación.
          </p>
          <button
            onClick={() => setShowEvaluate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm"
          >
            Evaluar rutina
          </button>
        </>
      )}

      {estado === "assigned" && showEvaluate && (
        <EvaluationForm userId={userId} name={name} age={age} />
      )}

      {/* Rutina evaluada */}
      {estado === "evaluated" && (
        <>
          <h3 className="text-lg font-semibold mb-4">
            Rutinas evaluadas del usuario
          </h3>

          {evaluatedRoutines.length > 0 ? (
            <table className="w-full text-sm text-left mb-4 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Archivo</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedRoutines.map((rutina) => (
                  <tr key={rutina.id} className="border-b">
                    <td className="px-4 py-2">
                      {rutina.routine?.name || "Rutina personalizada"}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(rutina.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`http://localhost:3000/uploads/routines/${rutina.customFile}`}
                        target="_blank"
                        className="text-blue-600 underline"
                        rel="noreferrer"
                      >
                        Descargar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay rutinas evaluadas disponibles.</p>
          )}

          {paymentStatus === "verde" ? (
            !showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-sm"
              >
                Asignar nueva rutina
              </button>
            ) : (
              <AssignRoutine userId={userId} setShowAssign={setShowAssign} />
            )
          ) : (
            <p className="text-red-600 text-sm mt-2">
              No se puede asignar una nueva rutina porque el usuario no tiene el
              pago al día.
            </p>
          )}
        </>
      )}
    </div>
  );
}
