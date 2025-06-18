import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Statistiques() {
  const [totalFiches, setTotalFiches] = useState(0);
  const [recentFiches, setRecentFiches] = useState(0);
  const [progression, setProgression] = useState(0);
  const [parMatiere, setParMatiere] = useState<Record<string, number>>({});
  const [parDifficulte, setParDifficulte] = useState<Record<string, number>>({});
  const [revisionsTerminees, setRevisionsTerminees] = useState(0); // ✅

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      // 🔹 Fiches
      const fichesQuery = query(collection(db, "fiches"), where("userId", "==", user.uid));
      const fichesSnapshot = await getDocs(fichesQuery);
      const fiches = fichesSnapshot.docs.map(doc => doc.data());
      setTotalFiches(fiches.length);

      const nouvellesFiches = fiches.filter(fiche => {
        const createdAt = fiche.createdAt?.toDate?.();
        return createdAt && createdAt > sevenDaysAgo;
      });
      setRecentFiches(nouvellesFiches.length);

      // 🔹 Progression fictive
      setProgression(Math.min(fiches.length * 10, 100));

      // 🔹 Regrouper par matière & difficulté
      const matieres: Record<string, number> = {};
      const difficultes: Record<string, number> = {};

      fiches.forEach((fiche) => {
        const mat = fiche.matiere?.toLowerCase()?.trim() || "Autre";
        const diff = fiche.difficulte || "Inconnue";
        matieres[mat] = (matieres[mat] || 0) + 1;
        difficultes[diff] = (difficultes[diff] || 0) + 1;
      });

      setParMatiere(matieres);
      setParDifficulte(difficultes);

      // 🔹 Révisions terminées
      const planningQuery = query(collection(db, "plannings"), where("userId", "==", user.uid));
      const planningSnapshot = await getDocs(planningQuery);
      const sessions = planningSnapshot.docs.map((doc) => doc.data());
      const terminees = sessions.filter((s) => s.terminee === true).length;
      setRevisionsTerminees(terminees);
    };

    fetchStats();
  }, []);

  const renderDonneesOuVide = (data: Record<string, number>) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return <p className="text-center text-gray-400">Aucune donnée disponible</p>;

    return (
      <ul className="space-y-2">
        {keys.map((key) => (
          <li key={key} className="flex justify-between">
            <span className="capitalize">{key}</span>
            <span className="font-semibold">{data[key]}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-purple-700">
        📊 Statistiques
      </h1>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard label="Fiches totales" value={totalFiches} icon="📘" color="bg-purple-100" />
        <StatCard label="Révisions effectuées" value={revisionsTerminees} icon="🕒" color="bg-blue-100" />
        <StatCard label="Taux de révision" value={`${progression}%`} icon="📈" color="bg-green-100" />
        <StatCard label="Nouvelles fiches (7j)" value={recentFiches} icon="🏅" color="bg-orange-100" />
      </div>

      {/* Graphiques simulés */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg text-purple-600 mb-4">
            🎯 Progression par matière
          </h2>
          {renderDonneesOuVide(parMatiere)}
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg text-blue-600 mb-4">
            🧠 Répartition par difficulté
          </h2>
          {renderDonneesOuVide(parDifficulte)}
        </div>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: any;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className={`text-3xl p-2 rounded-xl ${color}`}>{icon}</span>
    </div>
  );
}
