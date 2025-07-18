import axios from "axios";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa";

export default function DownloadEvaluatedRoutine({
  userId,
  assignmentId,
  fileName = "rutina-evaluada.xlsx",
}) {
  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = `http://localhost:3000/routines/user/${userId}/evaluated-download/${assignmentId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Error al descargar rutina evaluada", err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 flex items-center gap-2 justify-center hover:bg-blue-700 text-white px-4 py-2 rounded-md"
    >
      <FaDownload /> Descargar rutina
    </button>
  );
}
