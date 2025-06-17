import axios from "axios";
import { useEffect, useState } from "react";

export default function UserDashboard({ data, goBack }) {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ age: "", height: "", weight: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {}, [data]);

  return (
    <div className="p-6">
      <button onClick={goBack} className="text-blue-500 mb-4 underline">
        ← Volver
      </button>
      <div className="text-2xl text-black"> {data?.name}</div>
    </div>
  );
}
