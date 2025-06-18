import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Trash2 } from "lucide-react";
import FicheForm from "./FicheForm";

interface Fiche {
  id: string;
  titre: string;
  contenu: string;
  matiere: string;
  difficulte: string;
  createdAt?: any;
  tags?: string[];
}

export default function FicheList() {
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [search, setSearch] = useState("");
  const [matiereFilter, setMatiereFilter] = useState("");
  const [ficheEnEdition, setFicheEnEdition] = useState<Fiche | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "fiches"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fichesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          titre: data.titre || "",
          contenu: data.contenu || "",
          matiere: data.matiere || "",
          difficulte: data.difficulte || "Moyen",
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt,
        };
      });
      setFiches(fichesData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer cette fiche ?");
    if (!confirm) return;
    await deleteDoc(doc(db, "fiches", id));
  };

  const filteredFiches = fiches.filter(
    (fiche) =>
      fiche.titre.toLowerCase().includes(search.toLowerCase()) &&
      (matiereFilter === "" || fiche.matiere === matiereFilter)
  );

  if (ficheEnEdition) {
    return (
      <FicheForm
        initialData={{ ...ficheEnEdition, tags: ficheEnEdition.tags ?? [] }}
        onClose={() => setFicheEnEdition(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Mes Fiches de Révision</h1>
          <span className="text-sm text-gray-500">
            {filteredFiches.length} fiche{filteredFiches.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <select
            value={matiereFilter}
            onChange={(e) => setMatiereFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Toutes les matières</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Français">Français</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFiches.map((fiche) => (
            <div
              key={fiche.id}
              className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500 relative"
            >
              <h3 className="text-lg font-bold mb-1">{fiche.titre}</h3>
              <p className="text-sm text-gray-500">Matière : {fiche.matiere}</p>
              <p className="text-sm text-gray-700 mb-2">{fiche.contenu}</p>

              {fiche.tags && fiche.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {fiche.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setFicheEnEdition(fiche)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(fiche.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
