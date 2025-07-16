import { useDispatch } from "react-redux";
import RegisterLogin from "./RegisterLogin.jsx";
import { login, register } from "../../actions/authActions.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function Landing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  const handleRegister = (formData) => {
    console.log("ENVIANDO REGISTRO:", formData);
    const { name, email, password } = formData;

    if (
      formData.type === "register" &&
      formData.email !== "admin@oasisgym.com"
    ) {
      dispatch(register(name, email, password)).then(() => {
        navigate("/profile");
      });
    } else if (
      formData.type === "login" &&
      formData.email !== "admin@oasisgym.com"
    ) {
      dispatch(login(email, password)).then(() => {
        navigate("/profile");
      });
    } else {
      dispatch(login(email, password)).then(() => {
        navigate("/dashboard");
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/foto-gratis/vista-angulo-hombre-musculoso-irreconocible-preparandose-levantar-barra-club-salud_637285-2497.jpg?semt=ais_hybrid&w=740')",
      }}
    >
      <div className="bg-white/30 dark:bg-gray-900/50 backdrop-blur-md p-8 rounded-xl shadow-md max-w-md w-full">
        <RegisterLogin onSubmit={handleRegister} />
      </div>
    </div>
  );
}
