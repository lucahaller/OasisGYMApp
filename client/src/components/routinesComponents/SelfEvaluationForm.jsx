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

export default function SelfEvaluationForm({ userId, name, age, requestId }) {
  const [exercises, setExercises] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  // Traer ejercicios y progreso guardado si existe
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesRes, requestRes] = await Promise.all([
          axios.get(`http://localhost:3000/routines/user/${userId}/exercises`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:3000/evaluationrequests/user/${userId}/active`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setExercises(exercisesRes.data);

        const savedValues = {};
        if (requestRes.data?.data?.length) {
          requestRes.data.data.forEach((item, index) => {
            savedValues[index] = {
              peso: item.peso ?? "",
              reps: item.reps ?? "",
            };
          });
        }

        setValues(savedValues);
      } catch (error) {
        console.error("Error al cargar datos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  const handleChange = (index, field, value) => {
    setValues((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  const handleSaveProgress = async () => {
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

      await axios.patch(
        `http://localhost:3000/evaluationrequests/${requestId}/save`,
        { data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Progreso guardado correctamente ✅");
    } catch (err) {
      console.error(err);
      setMessage("Error al guardar el progreso ❌");
    }
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

      await axios.post(
        `http://localhost:3000/routines/user/${userId}/evaluate`,
        { ejercicios: data, nombre: name, edad: age },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Evaluación enviada correctamente ✅");
    } catch (err) {
      console.error(err);
      setMessage("Error al enviar la evaluación ❌");
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
            value={values[index]?.peso ?? ""}
            onChange={(e) => handleChange(index, "peso", e.target.value)}
          />
          <input
            type="number"
            placeholder="Reps logradas"
            className="border p-2 rounded-md w-full"
            value={values[index]?.reps ?? ""}
            onChange={(e) => handleChange(index, "reps", e.target.value)}
          />
        </div>
      ))}

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSaveProgress}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
        >
          Guardar Progreso
        </button>
        <button
          onClick={handleSubmit}
          className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded"
        >
          Enviar Evaluación
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
