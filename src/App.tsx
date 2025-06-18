import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MesFiches from "./pages/MesFiches";
import NouvelleFiche from "./pages/NouvelleFiche";
import Statistiques from "./pages/Statistiques";
import Planning from "./pages/Planning";
import Quiz from "./pages/Quiz";
import Examen from "./pages/Examen";
import NotificationManager from "./components/NotificationManager";
import SessionDetail from "./pages/SessionDetail";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  return (
    <BrowserRouter>
      {user ? (
        <>
          <NotificationManager /> {/* uniquement si notifications activées */}
          <Navbar userEmail={user.email || ""} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mes-fiches" element={<MesFiches />} />
            <Route path="/nouvelle-fiche" element={<NouvelleFiche />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/examen" element={<Examen />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/session/:id" element={<SessionDetail />} />
          </Routes>
        </>
      ) : (
        <AuthForm />
      )}
    </BrowserRouter>
  );
}

export default App;
