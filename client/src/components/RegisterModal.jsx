import { useState } from "react";

export default function RegisterModal({ isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    height: "",
    weight: "",
    notes: "",
    injury: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegister(formData);
      onClose(); // cerrar solo si no hay error
    } catch (err) {
      alert("Error al registrar usuario: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center
                 backdrop-blur-sm transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-labelledby="register-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-8
                      max-h-[90vh] overflow-y-auto"
      >
        <h2
          id="register-modal-title"
          className="text-2xl font-bold mb-6 text-gray-800 text-center"
        >
          Registrar Usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Nombre"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              name="age"
              type="number"
              placeholder="Edad (opcional)"
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition"
            />
            <input
              name="height"
              type="number"
              placeholder="Altura (cm, opcional)"
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition"
            />
            <input
              name="weight"
              type="number"
              placeholder="Peso (kg, opcional)"
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition"
            />
          </div>

          <input
            name="injury"
            placeholder="Lesiones (opcional)"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition"
          />

          <textarea
            name="notes"
            placeholder="Notas (opcional)"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition"
            rows={3}
          />

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 hover:text-gray-800
                         transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 focus:ring-4 focus:ring-blue-400
                         transition"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
