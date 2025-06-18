import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Fiche {
  id: string;
  titre: string;
  contenu: string;
  matiere: string;
}

export default function QuizPage() {
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchFiches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "fiches"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Fiche, "id">),
      }));

      const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 5);
      setFiches(shuffled);
    };

    fetchFiches();
  }, []);

  const handleValidate = () => {
    setShowCorrection(true);
    const fiche = fiches[currentIndex];
    const expected = fiche.contenu.trim().toLowerCase();
    const actual = userAnswer.trim().toLowerCase();
    if (actual === expected) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setShowCorrection(false);
    if (currentIndex + 1 < fiches.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (fiches.length === 0) {
    return <p className="text-center text-gray-600 mt-20">Chargement des fiches...</p>;
  }

  if (finished) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Quiz terminé !</h2>
        <p className="text-lg text-gray-700">Score : {score} / {fiches.length}</p>
      </div>
    );
  }

  const fiche = fiches[currentIndex];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        Quiz - Question {currentIndex + 1} / {fiches.length}
      </h1>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded h-2 mb-4">
        <div
          className="bg-purple-500 h-2 rounded"
          style={{ width: `${((currentIndex + 1) / fiches.length) * 100}%` }}
        />
      </div>

      <p className="mb-4 font-semibold">📚 {fiche.titre}</p>

      {!showCorrection ? (
        <>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded mb-4"
            placeholder="Écrivez votre réponse ici..."
          />
          <button
            onClick={handleValidate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Valider
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 mb-2">
            <strong>Votre réponse :</strong> {userAnswer || "(vide)"}
          </p>
          <p className="text-green-700">
            <strong>Correction :</strong> {fiche.contenu}
          </p>
          <button
            onClick={handleNext}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Suivant
          </button>
        </>
      )}
    </div>
  );
}
