import { useEffect, useState } from "react";
import axios from "axios";

export default function AssignRoutine({ userId, setShowAssign }) {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [saveInDb, setSaveInDb] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setMessage("✅ Rutina asignada con éxito");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al asignar rutina");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("saveToDB", saveInDb);

    try {
      setUploading(true);
      const res = await axios.post(
        "http://localhost:3000/routines/uploadexcel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { routine, fileUrl } = res.data;

      if (routine) {
        await axios.post(
          "http://localhost:3000/routines/assign",
          {
            userId,
            routineBaseId: routine.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/routines/assign",
          {
            userId,
            customFile: fileUrl.replace("/public/", ""),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setMessage("✅ Rutina personalizada asignada con éxito");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al subir o asignar rutina");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-md text-sm w-full relative text-gray-800 dark:text-gray-200">
      <button
        className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-red-600"
        onClick={() => setShowAssign(false)}
      >
        ×
      </button>

      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Asignar rutina</h3>

        <select
          className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-md mb-6"
        >
          Asignar rutina
        </button>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Subir rutina personalizada</h4>

          <input
            type="file"
            accept=".xlsx,.xls"
            className="mb-2"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label className="text-sm flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={saveInDb}
              onChange={(e) => setSaveInDb(e.target.checked)}
            />
            Guardar rutina en la base de datos
          </label>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            {uploading ? "Subiendo..." : "Subir y asignar"}
          </button>
        </div>

        {message && <p className="mt-3 font-medium">{message}</p>}
      </div>
    </div>
  );
}
