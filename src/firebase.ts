import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyAhSIi0glTJZj1GRgU2crdkXEOzPU-3i4Y",
  authDomain: firebaseConfigJson.authDomain || "gamevia-feae3.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "gamevia-feae3",
  storageBucket: firebaseConfigJson.storageBucket || "gamevia-feae3.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "267665736453",
  appId: firebaseConfigJson.appId || "1:267665736453:web:bae13830f501aed6aced6c",
  measurementId: firebaseConfigJson.measurementId || "G-79LN1W6Q1Y"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (support custom database id or default)
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection to Firestore on boot (as specified in Firebase integration guidelines)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client offline check:", error.message);
    }
  }
}
testConnection();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
};
