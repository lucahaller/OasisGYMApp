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
      // Convertir los numéricos a number si no están vacíos
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
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Registrar nuevo usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            onChange={handleChange}
            value={formData.name}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="number"
            name="age"
            placeholder="Edad (opcional)"
            onChange={handleChange}
            value={formData.age}
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="number"
            name="height"
            placeholder="Altura en cm (opcional)"
            onChange={handleChange}
            value={formData.height}
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="number"
            name="weight"
            placeholder="Peso en kg (opcional)"
            onChange={handleChange}
            value={formData.weight}
            className="w-full px-4 py-2 border rounded-md"
          />

          <textarea
            name="injury"
            placeholder="Lesión (opcional)"
            onChange={handleChange}
            value={formData.injury}
            rows={2}
            className="w-full px-4 py-2 border rounded-md resize-none"
          />

          <textarea
            name="notes"
            placeholder="Notas adicionales (opcional)"
            onChange={handleChange}
            value={formData.notes}
            rows={2}
            className="w-full px-4 py-2 border rounded-md resize-none"
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex justify-between text-lg mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-md bg-green-500 text-white hover:bg-green-700"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
