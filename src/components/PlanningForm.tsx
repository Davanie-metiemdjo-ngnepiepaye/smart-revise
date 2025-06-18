import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function PlanningForm() {
  const [matiere, setMatiere] = useState("");
  const [jour, setJour] = useState("lundi");
  const [heure, setHeure] = useState("18:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Utilisateur non connecté");

    await addDoc(collection(db, "plannings"), {
      userId: user.uid,
      matiere,
      jour,
      heure,
      createdAt: Timestamp.now(),
    });

    alert("Planning enregistré !");
    setMatiere("");
    setJour("lundi");
    setHeure("18:00");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Créer une séance de révision</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Matière</label>
        <input
          type="text"
          value={matiere}
          onChange={(e) => setMatiere(e.target.value)}
          required
          className="w-full p-2 border rounded mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Jour</label>
        <select
          value={jour}
          onChange={(e) => setJour(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          {["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"].map((j) => (
            <option key={j} value={j}>
              {j.charAt(0).toUpperCase() + j.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Heure</label>
        <input
          type="time"
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Enregistrer
      </button>
    </form>
  );
}
