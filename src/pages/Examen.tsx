import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Fiche {
  id: string;
  titre: string;
  contenu: string;
  matiere: string;
}

export default function Examen() {
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [ended, setEnded] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const fetchFiches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "fiches"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Fiche, "id">),
      }));

      const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
      setFiches(shuffled);
    };

    fetchFiches();
  }, []);

  useEffect(() => {
    if (fiches.length === 0 || ended) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEnded(true);
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fiches, ended]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (index + 1 < fiches.length) {
      setIndex(index + 1);
    } else {
      setEnded(true);
    }
  };

  if (fiches.length === 0) {
    return <div className="text-center mt-20 text-gray-500">Chargement des fiches...</div>;
  }

  if (ended) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-green-600">✅ Examen terminé !</h2>
        {timeUp ? (
          <p className="text-red-500">⏳ Temps écoulé</p>
        ) : (
          <p className="text-gray-600">Bravo pour avoir terminé votre session !</p>
        )}
      </div>
    );
  }

  const fiche = fiches[index];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">
        📝 Examen — Question {index + 1} / {fiches.length}
      </h1>

      <div className="mb-2 text-sm text-red-600">⏱ Temps restant : {formatTime(timer)}</div>

      <h2 className="text-lg font-semibold mb-2">{fiche.titre}</h2>

      {showAnswer ? (
        <div className="bg-gray-100 p-3 rounded text-gray-800 mb-4">{fiche.contenu}</div>
      ) : (
        <button
          onClick={() => setShowAnswer(true)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Voir la réponse
        </button>
      )}

      <button
        onClick={handleNext}
        disabled={ended}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  );
}
