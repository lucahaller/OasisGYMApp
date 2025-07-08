import { useEffect, useState } from "react";
import axios from "axios";

export default function AssignRoutine({ userId }) {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRoutines = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/routines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutines(res.data);
    };
    fetchRoutines();
  }, []);

  const handleAssign = async () => {
    if (!selectedRoutine) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:3000/routines/assign",
        {
          userId,
          routineBaseId: Number(selectedRoutine),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Rutina asignada con éxito");
    } catch (err) {
      setMessage("Error al asignar rutina");
    }
  };

  return (
    <div className="mt-8 bg-white border rounded-md p-6 shadow-sm text-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Asignar rutina
      </h3>

      <select
        className="w-full p-2 border rounded-sm mb-4"
        onChange={(e) => setSelectedRoutine(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Seleccionar rutina...
        </option>
        {routines.map((routine) => (
          <option key={routine.id} value={routine.id}>
            {routine.name} ({routine.type}, {routine.days} días)
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-sm"
      >
        Asignar rutina
      </button>

      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  );
}
