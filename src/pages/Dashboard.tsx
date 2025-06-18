import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [ficheCount, setFicheCount] = useState(0);
  const [planningCount, setPlanningCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [progression, setProgression] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }

      setUser(currentUser);

      try {
        const userId = currentUser.uid;

        // 🔢 Fiches
        const fichesSnap = await getDocs(
          query(collection(db, "fiches"), where("userId", "==", userId))
        );
        setFicheCount(fichesSnap.size);

        // 🔢 Sessions planifiées
        const planningsSnap = await getDocs(
          query(collection(db, "plannings"), where("userId", "==", userId))
        );
        const plannings = planningsSnap.docs.map(doc => doc.data());
        setPlanningCount(plannings.length);

        // ✅ Sessions marquées comme terminées
        const terminées = plannings.filter((p) => p.terminee === true).length;
        setCompletedCount(terminées);

        // 📈 Progression basée sur ratio terminé / total
        setProgression(plannings.length > 0 ? Math.round((terminées / plannings.length) * 100) : 0);
      } catch (err) {
        console.error("Erreur chargement des stats :", err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bonjour, Étudiant ! 👋</h1>
        <p className="text-sm text-gray-600">{user?.email}</p>
      </header>

      <p className="text-lg text-gray-700 mb-6">
        Prêt pour une nouvelle session de révision ?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatBox label="Fiches créées" value={ficheCount} icon="📖" color="text-purple-500" />
        <StatBox label="Sessions planifiées" value={planningCount} icon="📅" color="text-blue-500" />
        <StatBox label="Révisions terminées" value={completedCount} icon="✅" color="text-green-500" />
        <StatBox label="Progression" value={`${progression}%`} icon="📈" color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionButton
          color="bg-purple-600"
          hover="hover:bg-purple-700"
          title="Mode Quiz"
          subtitle="Testez vos connaissances"
          onClick={() => navigate("/quiz")}
        />
        <ActionButton
          color="bg-blue-600"
          hover="hover:bg-blue-700"
          title="Mode Examen"
          subtitle="Simulation d'examen"
          onClick={() => navigate("/examen")}
        />
        <ActionButton
          color="bg-green-600"
          hover="hover:bg-green-700"
          title="Nouvelle Fiche"
          subtitle="Créer du contenu"
          onClick={() => navigate("/nouvelle-fiche")}
        />
        <ActionButton
          color="bg-indigo-600"
          hover="hover:bg-indigo-700"
          title="Planification"
          subtitle="Organiser les révisions"
          onClick={() => navigate("/planning")}
        />
      </div>
    </div>
  );
}

// 🔹 Composant pour statistique
function StatBox({
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
      <span className={`text-3xl ${color}`}>{icon}</span>
    </div>
  );
}

// 🔹 Bouton d'action
function ActionButton({
  title,
  subtitle,
  color,
  hover,
  onClick,
}: {
  title: string;
  subtitle: string;
  color: string;
  hover: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} ${hover} text-white p-5 rounded-xl shadow transition`}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm">{subtitle}</p>
    </button>
  );
}
