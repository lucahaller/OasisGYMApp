import { useEffect, useState } from "react";
import axios from "axios";

export default function useLastEvaluatedRoutines(userId) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const token = localStorage.getItem("token");
      try {
        // Llamamos al endpoint que tú mismo definiste en el router:
        // GET /routines/user/:userId/evaluated/all
        const res = await axios.get(
          `http://localhost:3000/routines/user/${userId}/evaluated/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // El controlador ya hace `take: 2`, así que viene listo
        setRoutines(res.data);
      } catch (err) {
        console.error("Error al traer rutinas evaluadas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId]);
  console.log(routines);
  return { routines, loading };
}
