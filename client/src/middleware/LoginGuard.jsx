import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return setChecking(false);

    axios
      .get("http://localhost:3000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const role = res.data.user.role;
        if (role === "ADMIN") return navigate("/dashboard");
        else return navigate("/profile");
      })
      .catch(() => setChecking(false));
  }, []);

  return checking ? null : children;
}
