import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react"; // Icônes modernes

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 via-white to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-2">
          SmartRévise
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isLogin ? "Connectez-vous à votre compte" : "Créez un compte"}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            {showPassword ? (
              <EyeOff
                onClick={() => setShowPassword(false)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                size={20}
              />
            ) : (
              <Eye
                onClick={() => setShowPassword(true)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                size={20}
              />
            )}
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-md font-semibold hover:from-purple-600 hover:to-blue-600"
          >
            {isLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        <div className="my-4 text-center text-gray-400 text-sm">OU</div>

        <button
          onClick={handleGoogle}
          className="w-full border border-gray-300 rounded-md py-2 hover:bg-gray-100 font-medium"
        >
          Continuer avec Google
        </button>

        <div className="text-center mt-4">
          <button
            className="text-purple-600 text-sm hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Pas de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
          </button>
        </div>
      </div>
    </div>
  );
}
