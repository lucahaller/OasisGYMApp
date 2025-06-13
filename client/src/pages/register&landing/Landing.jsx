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
    <div className="min-h-full min-w-full">
      <RegisterLogin onSubmit={handleRegister} />
    </div>
  );
}
