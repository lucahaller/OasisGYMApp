import { useDispatch } from "react-redux";
import RegisterLogin from "./RegisterLogin.jsx";
import { login, register } from "../../actions/authActions.js";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleRegister = (formData) => {
    console.log("ENVIANDO REGISTRO:", formData);
    const { name, email, password } = formData;
    if (formData.type === "register") {
      dispatch(register(name, email, password)).then(() => {
        navigate("/profile");
      });
    } else if (formData.type === "login") {
      dispatch(login(email, password)).then(() => {
        navigate("/profile");
      });
    }
  };

  return (
    <div className="min-h-full min-w-full">
      <RegisterLogin onSubmit={handleRegister} />
    </div>
  );
}
