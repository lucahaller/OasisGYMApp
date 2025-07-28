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

export default function EvaluationForm({ userId, name, age }) {
  const [exercises, setExercises] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesRes, savedRes] = await Promise.all([
          axios.get(`http://localhost:3000/routines/user/${userId}/exercises`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:3000/evaluationrequests/user/${userId}/admin`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setExercises(exercisesRes.data);

        const savedValues = {};
        if (savedRes.data?.data?.length) {
          savedRes.data.data.forEach((item, index) => {
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = exercises.map((ex, index) => {
        const { peso, reps } = values[index] || {};
        return {
          ejercicio: ex.name,
          peso: Number(peso),
          reps: Number(reps),
        };
      });

      await axios.patch(
        `http://localhost:3000/evaluationrequests/user/${userId}/saveadmin`,
        { data },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Progreso guardado correctamente ✅");
    } catch (err) {
      console.error("Error al guardar:", err);
      setMessage("Error al guardar el progreso ❌");
    } finally {
      setSaving(false);
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
        {
          ejercicios: data,
          nombre: name,
          edad: age,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Evaluación enviada correctamente ✅");
      window.location.reload();
    } catch (err) {
      console.error("Error al enviar evaluación:", err);
      setMessage("Error al enviar la evaluación ❌");
    }
  };

  if (loading)
    return (
      <p className="text-gray-700 dark:text-gray-300">Cargando evaluación...</p>
    );

  return (
    <div className="mt-10 p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Evaluación del Usuario
      </h3>

      {exercises.map((ex, index) => (
        <div
          key={index}
          className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end"
        >
          <label
            htmlFor={`peso-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {ex.name}
          </label>

          <input
            id={`peso-${index}`}
            type="number"
            placeholder="Peso usado (kg)"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
            transition duration-150"
            value={values[index]?.peso ?? ""}
            onChange={(e) => handleChange(index, "peso", e.target.value)}
          />

          <input
            type="number"
            id={`reps-${index}`}
            placeholder="Reps logradas"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
            transition duration-150"
            value={values[index]?.reps ?? ""}
            onChange={(e) => handleChange(index, "reps", e.target.value)}
          />
        </div>
      ))}

      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          {saving ? "Guardando..." : "Guardar Progreso"}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Enviar Evaluación
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
}
