import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2M3LWCycmy2MUanqBVWJGBZwJGleiDM4",
  authDomain: "gymtrainer-pro-22c51.firebaseapp.com",
  projectId: "gymtrainer-pro-22c51",
  storageBucket: "gymtrainer-pro-22c51.firebasestorage.app",
  messagingSenderId: "819260444093",
  appId: "1:819260444093:web:4de9304fa262702c6bd6d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Cloud Firestore using the specific database ID provisioned for this applet
const db = getFirestore(app, "ai-studio-gymtrainerpro-7cd366cd-12f3-494d-8867-b39cb199ab10");

export { app, auth, db };
