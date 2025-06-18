// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABr8o2A1qcFY740SgpWthjxt7H3w-77oM",
  authDomain: "smart-revise.firebaseapp.com",
  projectId: "smart-revise",
  storageBucket: "smart-revise.firebasestorage.app",
  messagingSenderId: "589021714869",
  appId: "1:589021714869:web:65d1002feede90e11121fc",
  measurementId: "G-78HWFK1SBK"
};

const app = initializeApp(firebaseConfig);

// ✅ On exporte bien auth et db ici
export const auth = getAuth(app);
export const db = getFirestore(app);
