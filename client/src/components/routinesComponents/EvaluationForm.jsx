import { useEffect, useState } from "react";
import axios from "axios";

const percentageTable = {
  1: 100,
  2: 95,
  3: 90,
  4: 85,
  5: 80,
  6: 78,
  7: 77,
  8: 75,
  9: 72,
  10: 70,
};

const calculateRM = (peso, reps) => {
  const pct = percentageTable[reps] || 69;
  return Math.round((peso * 100) / pct);
};

export default function EvaluationForm({ userId, name, age }) {
  const [exercises, setExercises] = useState([]); // lista de ejercicios
  const [request, setRequest] = useState(null); // la evaluación activa
  const [values, setValues] = useState({}); // { [ejercicio]: { peso, reps } }
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) ejercicios
        const [exRes, evRes] = await Promise.all([
          axios.get(`http://localhost:3000/routines/user/${userId}/exercises`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:3000/evaluationrequests/user/${userId}/active`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setExercises(exRes.data);

        // 2) si hay evaluación activa, guardamos request y poblamos valores
        if (evRes.data && evRes.data.id && Array.isArray(evRes.data.data)) {
          setRequest(evRes.data);
          // armar map de datos por nombre de ejercicio
          const saved = {};
          evRes.data.data.forEach((e) => {
            saved[e.ejercicio] = {
              peso: e.peso ?? "",
              reps: e.reps ?? "",
            };
          });
          setValues(saved);
        }
      } catch (err) {
        console.error("Error cargando ejercicios o evaluación:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId, token]);

  const handleChange = (exerciseName, field, v) => {
    setValues((prev) => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: v,
      },
    }));
  };

  const handleSave = async () => {
    if (!request?.id) return;
    try {
      // construir array en el mismo orden de exercises
      const data = exercises.map((ex) => {
        const { peso, reps } = values[ex.name] || {};
        const rm = calculateRM(Number(peso), Number(reps));
        return {
          ejercicio: ex.name,
          peso: peso ? Number(peso) : null,
          reps: reps ? Number(reps) : null,
          rm,
        };
      });

      await axios.patch(
        `http://localhost:3000/evaluationrequests/${request.id}/save`,
        { data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Progreso guardado correctamente");
    } catch (err) {
      console.error(err);
      setMessage("Error al guardar el progreso");
    }
  };

  if (loading) return <p className="text-sm">Cargando ejercicios...</p>;

  return (
    <div className="mt-10 p-6 bg-white border rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">Evaluación de rutina</h3>

      {exercises.map((ex) => (
        <div
          key={ex.name}
          className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
        >
          <label className="block text-sm font-medium text-gray-700">
            {ex.name}
          </label>
          <input
            type="number"
            placeholder="Peso usado (kg)"
            className="border p-2 rounded-md w-full"
            value={values[ex.name]?.peso ?? ""}
            onChange={(e) => handleChange(ex.name, "peso", e.target.value)}
          />
          <input
            type="number"
            placeholder="Reps logradas"
            className="border p-2 rounded-md w-full"
            value={values[ex.name]?.reps ?? ""}
            onChange={(e) => handleChange(ex.name, "reps", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
      >
        Guardar progreso
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
