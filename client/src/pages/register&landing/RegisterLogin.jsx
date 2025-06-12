import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RegisterLogin({ onSubmit }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";

  const [formData, setFormData] = useState({
    type: isLogin ? "login" : "register",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type: isLogin ? "login" : "register",
    }));
  }, [isLogin]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (typeof onSubmit !== "function") {
      console.error("onSubmit no es una función válida");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    onSubmit(formData);
  };

  const toggleForm = () => {
    navigate(isLogin ? "/register" : "/login");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Iniciar Sesión" : "Registro"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                className="mt-1 block w-full text-black px-4 py-2 border rounded-md"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="mt-1 block w-full text-black px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              className="mt-1 block w-full text-black px-4 py-2 border rounded-md"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                onChange={handleChange}
                className="mt-1 block w-full text-black px-4 py-2 border rounded-md"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            {isLogin ? "Iniciar sesión" : "Registrarse"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={toggleForm} className="text-blue-600 underline">
            {isLogin
              ? "¿No tenés cuenta? Registrate"
              : "¿Ya tenés cuenta? Iniciá sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
