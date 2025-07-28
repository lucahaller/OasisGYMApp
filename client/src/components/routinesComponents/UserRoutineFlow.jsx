import { useEffect, useState } from "react";
import axios from "axios";
import AssignRoutine from "./AssignRoutine";
import EvaluationForm from "./EvaluationForm";
import DownloadEvaluatedRoutine from "../../pages/profile/DownloadEvaluatedRoutine";
import { MdAssignmentAdd } from "react-icons/md";
export default function UserRoutineFlow({ userId, paymentStatus, name, age }) {
  const [estado, setEstado] = useState("loading");
  const [showAssign, setShowAssign] = useState(false);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [evaluatedRoutines, setEvaluatedRoutines] = useState([]);
  const token = localStorage.getItem("token");

  // 1. Recuperar estado de rutina (no-assigned, assigned, evaluated)
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
  }, [userId, showAssign, showEvaluate, token]);

  // 2. Si está evaluada, traer las dos últimas assignments
  useEffect(() => {
    if (estado === "evaluated") {
      (async () => {
        try {
          const res = await axios.get(
            `http://localhost:3000/routines/user/${userId}/evaluated/all`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEvaluatedRoutines(res.data);
        } catch (err) {
          console.error("Error al cargar evaluaciones:", err);
        }
      })();
    }
  }, [estado, userId, token]);

  if (estado === "loading") {
    return (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Cargando rutina...
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-lg shadow mt-6 text-sm text-gray-800 dark:text-gray-200">
      {/* No asignada */}
      {estado === "no-assigned" && (
        <>
          <p className="mb-3">El usuario no tiene una rutina asignada.</p>
          {paymentStatus === "verde" || paymentStatus === "amarillo" ? (
            !showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                className="bg-blue-600 flex flex-row gap-2 justify-center items-center hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                <MdAssignmentAdd className="text-md" /> Asignar rutina
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

      {/* Asignada pero sin evaluar */}
      {estado === "assigned" && !showEvaluate && (
        <>
          <p className="mb-3">
            El usuario tiene una rutina pendiente de evaluación.
          </p>
          <button
            onClick={() => setShowEvaluate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Evaluar rutina
          </button>
        </>
      )}
      {estado === "assigned" && showEvaluate && (
        <EvaluationForm userId={userId} name={name} age={age} />
      )}

      {/* Evaluada */}
      {estado === "evaluated" && (
        <>
          <h3 className="text-lg font-semibold mb-4">
            Rutinas evaluadas del usuario
          </h3>

          {evaluatedRoutines.length > 0 ? (
            <div className="overflow-x-auto rounded-md border dark:border-gray-600 mb-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Archivo</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluatedRoutines.map((rutina) => (
                    <tr
                      key={rutina.id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2">
                        {rutina.routine?.name || "Rutina personalizada"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(rutina.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {/* Aquí le pasamos assignmentId para descargar esa rutina */}
                        <DownloadEvaluatedRoutine
                          userId={userId}
                          assignmentId={rutina.id}
                          fileName={`
                            ${
                              rutina.routine?.name
                                ?.replace(/\s+/g, "-")
                                .toLowerCase() || "rutina"
                            }-${new Date(rutina.updatedAt)
                            .toISOString()
                            .slice(0, 10)}.xlsx`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay rutinas evaluadas disponibles.</p>
          )}

          {/* Botón Asignar nueva */}
          {paymentStatus === "verde" || paymentStatus === "amarillo" ? (
            !showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                className="bg-blue-600 flex flex-row gap-2 justify-center items-center hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                <MdAssignmentAdd className="text-md" /> Asignar rutina
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
