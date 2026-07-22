import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB82EjL9yEoq34wy1nz7zYbhimMJXhS8yo",
  authDomain: "screetspace-6d74e.firebaseapp.com",
  projectId: "screetspace-6d74e",
  storageBucket: "screetspace-6d74e.firebasestorage.app",
  messagingSenderId: "609906597619",
  appId: "1:609906597619:web:15f832c5df970759572186",
  measurementId: "G-T223ZGDM5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);