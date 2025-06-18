import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [fiches, setFiches] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !auth.currentUser) return;

      const sessionRef = doc(db, "plannings", id);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) return;

      const sessionData = sessionSnap.data();
      setSession(sessionData);

      if (sessionData.fiches?.length > 0) {
        const fichesRef = collection(db, "fiches");
        const q = query(fichesRef, where("userId", "==", auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const fichesData = snapshot.docs
          .filter((doc) => sessionData.fiches.includes(doc.id))
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setFiches(fichesData);
      }
    };

    fetchData();
  }, [id]);

  const marquerCommeTerminee = async () => {
    if (!id) return;
    await updateDoc(doc(db, "plannings", id), { terminee: true });
    alert("Session marquée comme terminée !");
    navigate("/planning");
  };

  if (!session) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        Session : {session.matiere}
      </h1>
      <p className="mb-2"><strong>Heure :</strong> {session.heure}</p>
      <p className="mb-4"><strong>Durée :</strong> {session.duree} min</p>

      <h2 className="text-lg font-semibold mb-2">📘 Fiches à réviser</h2>
      <ul className="space-y-2">
        {fiches.map((fiche) => (
          <li key={fiche.id} className="bg-white p-3 rounded shadow">
            <strong>{fiche.titre}</strong>
            {fiche.contenu && <p className="text-sm text-gray-600 mt-1">{fiche.contenu}</p>}
          </li>
        ))}
      </ul>

      <button
        onClick={marquerCommeTerminee}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
      >
        ✅ Marquer comme terminée
      </button>
    </div>
  );
}
