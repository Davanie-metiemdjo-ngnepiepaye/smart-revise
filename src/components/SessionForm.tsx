import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";

interface Fiche {
  id: string;
  titre: string;
}

export default function SessionForm({ onClose }: { onClose: () => void }) {
  const [matiere, setMatiere] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [duree, setDuree] = useState("60");
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [selectedFiches, setSelectedFiches] = useState<string[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchFiches = async () => {
      const q = query(collection(db, "fiches"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data: Fiche[] = snapshot.docs.map((doc) => {
        const ficheData = doc.data();
        return {
          id: doc.id,
          titre: ficheData.titre || "Sans titre",
        };
      });
      setFiches(data);
    };

    fetchFiches();
  }, []);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    const matiereTrimmed = matiere.trim();
    if (!user || !matiereTrimmed || !datetime) return;

    try {
      const dateObj = new Date(datetime);
      if (isNaN(dateObj.getTime())) {
        alert("Date invalide !");
        return;
      }

      const jour = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const heure = datetime.split("T")[1]?.slice(0, 5); // "HH:mm"

      if (!heure) {
        alert("Heure invalide !");
        return;
      }

      await addDoc(collection(db, "plannings"), {
        userId: user.uid,
        matiere: matiereTrimmed,
        description,
        jour,
        heure,
        duree,
        fiches: selectedFiches,
        estTerminee: false, // ✅ Ajouté ici
      });

      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la création :", error.message);
      alert("Erreur lors de la création : " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Nouvelle session de révision</h2>

        <label className="block mb-2">Matière *</label>
        <input
          type="text"
          value={matiere}
          onChange={(e) => setMatiere(e.target.value)}
          placeholder="Ex: Physique"
          required
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2">Description (optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails sur cette session…"
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-2">Date et heure *</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2">Durée (minutes)</label>
            <select
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="30">30 min</option>
              <option value="60">1 heure</option>
              <option value="90">1h30</option>
              <option value="120">2 heures</option>
            </select>
          </div>
        </div>

        <label className="block mb-2">Fiches à réviser</label>
        <select
          multiple
          value={selectedFiches}
          onChange={(e) =>
            setSelectedFiches(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border p-2 rounded h-32"
        >
          {fiches.length > 0 ? (
            fiches.map((fiche) => (
              <option key={fiche.id} value={fiche.id}>
                {fiche.titre}
              </option>
            ))
          ) : (
            <option disabled>Aucune fiche disponible</option>
          )}
        </select>

        <p className="text-sm mt-1 text-gray-600">
          {selectedFiches.length} fiche(s) sélectionnée(s)
        </p>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded border text-gray-600">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Créer la session
          </button>
        </div>
      </div>
    </div>
  );
}
