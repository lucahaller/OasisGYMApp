import { useState } from "react";

export default function RegisterModal({ isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    height: "",
    weight: "",
    notes: "",
    injury: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    onRegister(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Registrar Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Nombre"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar Contraseña"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="age"
            type="number"
            placeholder="Edad (opcional)"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="height"
            type="number"
            placeholder="Altura (cm, opcional)"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="weight"
            type="number"
            placeholder="Peso (kg, opcional)"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="injury"
            placeholder="Lesiones (opcional)"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="notes"
            placeholder="Notas (opcional)"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Registrar
            </button>
            <button type="button" onClick={onClose} className="text-red-600">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
