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
  const porcentaje = percentageTable[reps] || 69;
  return Math.round((peso * 100) / porcentaje);
};

export default function EvaluationForm({ userId }) {
  const [exercises, setExercises] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRoutineExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/routines/user/${userId}/exercises`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExercises(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar ejercicios", error);
      }
    };

    fetchRoutineExercises();
  }, [userId]);

  const handleChange = (index, field, value) => {
    const updated = { ...values };
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setValues(updated);
  };

  const handleSubmit = async () => {
    try {
      const data = exercises.map((ex, index) => {
        const { peso, reps } = values[index] || {};
        const rm = calculateRM(peso, reps);
        return {
          ejercicio: ex.name,
          peso: Number(peso),
          reps: Number(reps),
          rm,
        };
      });

      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/routines/user/${userId}/evaluate`,
        { ejercicios: data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Evaluación enviada correctamente");
    } catch (err) {
      setMessage("Error al enviar la evaluación");
      console.error(err);
    }
  };

  if (loading) return <p className="text-sm">Cargando ejercicios...</p>;

  return (
    <div className="mt-10 p-6 bg-white border rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">Evaluación de rutina</h3>
      {exercises.map((ex, index) => (
        <div
          key={index}
          className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {ex.name}
            </label>
          </div>
          <input
            type="number"
            placeholder="Peso usado (kg)"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleChange(index, "peso", e.target.value)}
          />
          <input
            type="number"
            placeholder="Reps logradas"
            className="border p-2 rounded-md w-full"
            onChange={(e) => handleChange(index, "reps", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-sm transition"
      >
        Enviar evaluación
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
