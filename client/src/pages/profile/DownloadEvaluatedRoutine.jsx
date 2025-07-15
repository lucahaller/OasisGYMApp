import axios from "axios";
import { saveAs } from "file-saver";

export default function DownloadEvaluatedRoutine({ userId }) {
  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:3000/routines/user/${userId}/evaluated-download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Importante para archivos
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      saveAs(blob, "rutina-evaluada.xlsx");
    } catch (err) {
      console.error("Error al descargar rutina evaluada", err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4"
    >
      Descargar rutina
    </button>
  );
}
