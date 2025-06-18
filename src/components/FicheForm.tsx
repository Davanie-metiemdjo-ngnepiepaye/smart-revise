import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import VocalInput from "./VocalInput";

interface FicheFormProps {
  initialData?: {
    id?: string;
    titre: string;
    matiere: string;
    contenu: string;
    difficulte: string;
    tags: string[];
  };
  onClose?: () => void;
}

export default function FicheForm({ initialData, onClose }: FicheFormProps) {
  const [titre, setTitre] = useState(initialData?.titre || "");
  const [matiere, setMatiere] = useState(initialData?.matiere || "");
  const [contenu, setContenu] = useState(initialData?.contenu || "");
  const [difficulte, setDifficulte] = useState(initialData?.difficulte || "Moyen");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const fiche = {
      userId: user.uid,
      titre,
      matiere,
      contenu,
      difficulte,
      tags: tagArray,
      updatedAt: serverTimestamp(),
    };

    try {
      if (initialData?.id) {
        // Mode édition
        await updateDoc(doc(db, "fiches", initialData.id), fiche);
        setMessage("✅ Fiche mise à jour !");
      } else {
        // Nouvelle fiche
        await addDoc(collection(db, "fiches"), {
          ...fiche,
          createdAt: serverTimestamp(),
        });
        setMessage("✅ Fiche ajoutée !");
      }

      setError("");
      if (onClose) onClose();
    } catch (err: any) {
      setMessage("");
      setError("❌ Erreur : " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">
          {initialData ? "✏️ Modifier la fiche" : "➕ Nouvelle fiche de révision"}
        </h1>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Théorème de Pythagore"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none"
              />
              <div className="absolute right-2 top-2">
                <VocalInput onResult={setTitre} />
              </div>
            </div>
          </div>

          {/* Matière + Difficulté */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Matière *</label>
              <input
                type="text"
                value={matiere}
                onChange={(e) => setMatiere(e.target.value)}
                required
                placeholder="Ex: Mathématiques"
                className="w-full border border-gray-300 rounded-md p-3"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Difficulté</label>
              <select
                value={difficulte}
                onChange={(e) => setDifficulte(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              >
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ex: géométrie, théorème"
              className="w-full border border-gray-300 rounded-md p-3"
            />
            <small className="text-gray-400">Séparez les tags par des virgules</small>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium mb-1">Contenu *</label>
            <div className="relative">
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Expliquez le concept ici..."
                required
                className="w-full p-3 pr-10 h-28 border border-gray-300 rounded-md resize-none"
              />
              <div className="absolute right-2 top-2">
                <VocalInput onResult={setContenu} />
              </div>
            </div>
          </div>

          {/* Bouton */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              {initialData ? "✅ Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
