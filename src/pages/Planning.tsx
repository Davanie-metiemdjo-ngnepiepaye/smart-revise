import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import SessionForm from "../components/SessionForm";

interface Planning {
  id: string;
  matiere: string;
  jour?: string;
  heure: string;
  duree?: string;
  userId: string;
  terminee: boolean;
  fiches?: string[];
}

interface FicheMap {
  [id: string]: string;
}

export default function PlanningPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [ficheMap, setFicheMap] = useState<FicheMap>({});
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"calendrier" | "liste">("calendrier");

  const demanderNotification = async () => {
    if (!("Notification" in window)) {
      alert("Notifications non supportées sur ce navigateur.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("🔔 Notifications activées", {
        body: "Tu recevras des rappels de révision.",
      });
    } else {
      alert(`Permission refusée ou inconnue : ${permission}`);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadData = async () => {
      const fichesSnap = await getDocs(
        query(collection(db, "fiches"), where("userId", "==", user.uid))
      );
      const map: FicheMap = {};
      fichesSnap.docs.forEach((doc) => {
        const data = doc.data();
        map[doc.id] = data.titre || "Sans titre";
      });
      setFicheMap(map);
    };

    loadData();

    const q = query(collection(db, "plannings"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Planning[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          matiere: d.matiere || "Non spécifiée",
          jour: d.jour,
          heure: d.heure || "--:--",
          duree: d.duree || "60",
          userId: d.userId,
          terminee: !!d.terminee,
          fiches: d.fiches || [],
        };
      });
      setPlannings(data);
    });

    return () => unsubscribe();
  }, []);

  const jourFr = new Date(selectedDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette session ?")) return;
    try {
      await deleteDoc(doc(db, "plannings", id));
    } catch (err) {
      console.error("❌ Erreur de suppression :", err);
    }
  };

  const marquerCommeTerminee = async (id: string) => {
    if (!window.confirm("Marquer cette session comme terminée ?")) return;
    try {
      await updateDoc(doc(db, "plannings", id), { terminee: true });
    } catch (err) {
      console.error("❌ Erreur mise à jour :", err);
    }
  };

  const renderSession = (s: Planning) => (
    <li key={s.id} className="bg-purple-100 p-3 rounded flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span>
          📘 {s.jour || ""} {s.heure} — {s.matiere} {s.terminee && "✅"}
        </span>
        <div className="flex gap-2">
          {!s.terminee && (
            <button
              onClick={() => marquerCommeTerminee(s.id)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              ✅ Terminer
            </button>
          )}
          <button
            onClick={() => handleDelete(s.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
      {s.fiches && s.fiches.length > 0 && (
        <ul className="text-sm text-gray-700 pl-4 list-disc">
          {s.fiches.map((ficheId) => (
            <li key={ficheId}>{ficheMap[ficheId] || `Fiche ID : ${ficheId}`}</li>
          ))}
        </ul>
      )}
    </li>
  );

  const filtered = plannings.filter((p) =>
    view === "calendrier" ? p.jour === selectedDate : true
  );

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-700 mb-4 flex items-center gap-2">
        📅 Planification des révisions
      </h1>

      <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded mb-4 flex items-center gap-2">
        🔕 Activez les notifications pour recevoir des rappels de révision
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <button
          onClick={demanderNotification}
          className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded"
        >
          🔔 Activer les rappels
        </button>

        <div className="flex gap-2">
          {["calendrier", "liste"].map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode as "calendrier" | "liste")}
              className={`px-4 py-2 rounded shadow font-semibold ${
                view === mode
                  ? "bg-white text-purple-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {mode === "calendrier" ? "Calendrier" : "Liste"}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded font-semibold"
        >
          ➕ Nouvelle session
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        {view === "calendrier" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded"
          />
        )}
        <h2 className="text-lg font-bold mt-4">
          {view === "calendrier"
            ? `Sessions du ${jourFr}`
            : "📋 Toutes les sessions"}
        </h2>
        {filtered.length > 0 ? (
          <ul className="mt-2 space-y-2">{filtered.map(renderSession)}</ul>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <div className="text-5xl mb-2">📅</div>
            <p className="text-lg font-semibold">
              Aucune session {view === "calendrier" ? "planifiée" : "enregistrée"}
            </p>
            <p className="text-sm">Créez une session pour commencer.</p>
          </div>
        )}
      </div>

      {showForm && <SessionForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
