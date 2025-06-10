import { useDispatch } from "react-redux";
import RegisterLogin from "./RegisterLogin.jsx";
import { register } from "../../actions/authActions.js";

export default function Landing() {
  const dispatch = useDispatch();

  const handleRegister = (formData) => {
    console.log("ENVIANDO REGISTRO:", formData);
    const { name, email, password } = formData;
    dispatch(register(name, email, password));
  };
  return (
    <div className="min-h-full min-w-full">
      <RegisterLogin onSubmit={handleRegister} />
    </div>
  );
}
