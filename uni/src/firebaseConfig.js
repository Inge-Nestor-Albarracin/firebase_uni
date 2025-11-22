import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBdK5jL9gYEnKlmcsB66QR-4SxThx8F1lw",
  authDomain: "proyectouni-a944f.firebaseapp.com",
  projectId: "proyectouni-a944f",
  storageBucket: "proyectouni-a944f.firebasestorage.app",
  messagingSenderId: "686162220090",
  appId: "1:686162220090:web:1bc19ed0a35702dd78d103"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app); // ✅ ¡Esto es necesario!
export { auth, db };