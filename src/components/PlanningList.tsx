import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

interface Planning {
  id: string;
  matiere: string;
  jour: string;         // ex: 2025-06-18
  datetime: string;     // ex: 2025-06-18T10:00
  duree: string;
  description?: string;
}

export default function PlanningList() {
  const [plannings, setPlannings] = useState<Planning[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "plannings"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          matiere: raw.matiere || "Matière non précisée",
          jour: raw.jour || "Date inconnue",
          datetime: raw.datetime || "",
          duree: raw.duree || "60",
          description: raw.description || "",
        };
      });
      setPlannings(data);
    });

    return () => unsubscribe();
  }, []);

  if (plannings.length === 0) {
    return <p className="text-center text-gray-500 mt-10">Aucun planning enregistré.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">📋 Vos séances planifiées</h2>
      <ul className="space-y-3">
        {plannings.map((plan) => {
          const heure = plan.datetime
            ? new Date(plan.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Heure inconnue";

          return (
            <li
              key={plan.id}
              className="bg-white shadow rounded p-4 border-l-4 border-purple-500"
            >
              <p className="font-semibold text-purple-700">
                📅 {plan.jour} à {heure}
              </p>
              <p className="text-gray-800">
                🧠 Révision de <strong>{plan.matiere}</strong>
              </p>
              {plan.description && (
                <p className="text-sm text-gray-600 italic mt-1">{plan.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">⏱ Durée : {plan.duree} min</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
