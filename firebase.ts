
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Web uygulamanızın Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyBk2jWt9KeWH8-FYcsJqsvnAEriFc4jMOA",
  authDomain: "kasif-da96e.firebaseapp.com",
  projectId: "kasif-da96e",
  storageBucket: "kasif-da96e.firebasestorage.app",
  messagingSenderId: "483654734660",
  appId: "1:483654734660:web:022630f74145d3d0ff3d11"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanı referansını dışa aktar
export const db = getFirestore(app);
