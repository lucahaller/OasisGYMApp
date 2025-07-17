import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import RegisterLogin from "./RegisterLogin.jsx";
import { login } from "../../actions/authActions.js";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (formData) => {
    const { email, password } = formData;

    dispatch(login(email, password))
      .then((user) => {
        if (email === "admin@oasisgym.com") {
          navigate("/dashboard");
        } else {
          navigate("/profile");
        }
      })
      .catch((errorMessage) => {
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
          },
          icon: "⚠️",
        });
      });
  };

  return (
    <>
      <Toaster />
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/foto-gratis/vista-angulo-hombre-musculoso-irreconocible-preparandose-levantar-barra-club-salud_637285-2497.jpg?semt=ais_hybrid&w=740')",
        }}
      >
        <div className="bg-white/30 dark:bg-gray-900/50 backdrop-blur-md p-8 rounded-xl shadow-md max-w-md w-full">
          <RegisterLogin onSubmit={handleLogin} />
        </div>
      </div>
    </>
  );
}
