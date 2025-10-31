import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  // TODO: use variaveis de ambientes depois...
  apiKey: "AIzaSyC4YyGruYe1NIF439wYuItNl_GwxCGicRs", // VITE_FIREBASE_API_KEY
  authDomain: "image-processing-ff14e.firebaseapp.com",
  projectId: "image-processing-ff14e",
  storageBucket: "image-processing-ff14e.firebasestorage.app",
  messagingSenderId: "869470833195",
  appId: "1:869470833195:web:84347990a250ce4bba786e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
signInAnonymously(auth).catch((err) => {
  console.warn("Anonymous auth failed:", err);
});

export const listenJob = (jobId: string, callback: (data: any) => void) => {
  const docRef = doc(db, "jobs", jobId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    },
    (error) => {
      console.warn("Firestore listener error:", error);
    }
  );
};
