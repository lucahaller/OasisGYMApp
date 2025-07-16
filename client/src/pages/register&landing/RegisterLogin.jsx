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
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        {isLogin ? "Iniciar Sesión" : "Registro"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              onChange={handleChange}
              value={formData.name}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                         focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Tu nombre"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 16"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={handleChange}
              value={formData.email}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                         focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            onChange={handleChange}
            value={formData.password}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                       dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                       dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Contraseña"
          />
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              onChange={handleChange}
              value={formData.confirmPassword}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                         focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Confirmar contraseña"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
        >
          {isLogin ? "Iniciar sesión" : "Registrarse"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
        {isLogin
          ? "¿No tienes cuenta?"
          : "Registrate con el asesoramiento de tu profresor"}{" "}
        <button
          onClick={toggleForm}
          className="text-blue-600 hover:underline font-semibold"
          type="button"
        >
          {isLogin
            ? "Registrate con el asesoramiento de tu profresor"
            : "Registrate con el asesoramiento de tu profresor"}
        </button>
      </p>
    </div>
  );
}
