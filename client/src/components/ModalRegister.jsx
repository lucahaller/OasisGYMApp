import { useState } from "react";

export default function ModalRegister({ isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    injury: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalData = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
      };

      await onRegister(finalData);
      alert("Usuario registrado correctamente");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError("El correo ya está registrado o hubo un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
          Registrar nuevo usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            onChange={handleChange}
            value={formData.name}
            required
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            onChange={handleChange}
            value={formData.email}
            required
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            value={formData.password}
            required
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Edad */}
          <input
            type="number"
            name="age"
            placeholder="Edad (opcional)"
            onChange={handleChange}
            value={formData.age}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Altura */}
          <input
            type="number"
            name="height"
            placeholder="Altura en cm (opcional)"
            onChange={handleChange}
            value={formData.height}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Peso */}
          <input
            type="number"
            name="weight"
            placeholder="Peso en kg (opcional)"
            onChange={handleChange}
            value={formData.weight}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Lesión */}
          <textarea
            name="injury"
            placeholder="Lesión (opcional)"
            onChange={handleChange}
            value={formData.injury}
            rows={2}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg resize-none
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {/* Notas */}
          <textarea
            name="notes"
            placeholder="Notas adicionales (opcional)"
            onChange={handleChange}
            value={formData.notes}
            rows={2}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg resize-none
              focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150"
          />

          {error && (
            <p className="text-sm text-red-600 text-center mt-2">{error}</p>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
