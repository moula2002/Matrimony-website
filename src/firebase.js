import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1R6DGJUF09xeO4Jhoh2LenU7hIpMG7Rc",
  authDomain: "familiess-724f8.firebaseapp.com",
  projectId: "familiess-724f8",
  storageBucket: "familiess-724f8.firebasestorage.app",
  messagingSenderId: "234150053009",
  appId: "1:234150053009:web:f3bb4c9ef7be0c8b1b2b30",
  measurementId: "G-MJTV9LQN0C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };
