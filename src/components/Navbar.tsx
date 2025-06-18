import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export default function Navbar({ userEmail, onLogout }: Props) {
  const location = useLocation();

  // Fonction pour appliquer un style actif selon la page
  const linkClass = (path: string) =>
    `flex items-center gap-1 px-3 py-1 rounded-xl font-medium transition ${
      location.pathname === path
        ? "bg-purple-100 text-purple-700"
        : "text-gray-700 hover:text-purple-600"
    }`;

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
        📖 <span className="text-blue-600">Smart</span>Révise
      </div>

      {/* Liens */}
      <div className="flex gap-6 items-center">
        <Link to="/" className={linkClass("/")}>🏠 Tableau de bord</Link>
        <Link to="/mes-fiches" className={linkClass("/mes-fiches")}>📚 Mes Fiches</Link>
        <Link to="/nouvelle-fiche" className={linkClass("/nouvelle-fiche")}>➕ Nouvelle Fiche</Link>
        <Link to="/planning" className={linkClass("/planning")}>📅 Planification</Link>
        <Link to="/statistiques" className={linkClass("/statistiques")}>📊 Statistiques</Link>
      </div>

      {/* Profil & logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{userEmail}</span>
        <button
          onClick={onLogout}
          className="text-xl text-gray-500 hover:text-red-500 transition"
          title="Se déconnecter"
        >
          ↩️
        </button>
      </div>
    </nav>
  );
}
