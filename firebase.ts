import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Verileri .env dosyasından çekiyoruz
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Database servislerini dışarı aktar (Uygulamanın diğer yerlerinde kullanmak için)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
