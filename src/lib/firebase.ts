import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Check for redirect result on app load (PWA / Mobile redirect support)
if (typeof window !== 'undefined') {
  getRedirectResult(auth).catch((err) => {
    console.warn('Error processing Google redirect result:', err);
  });
}

// Auth Helpers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Popup login failed, attempting redirect fallback:', error);
    const errCode = error?.code || '';
    const errMsg = String(error?.message || '');

    if (
      errCode === 'auth/popup-blocked' ||
      errCode === 'auth/popup-closed-by-user' ||
      errCode === 'auth/operation-not-supported-in-this-environment' ||
      errCode === 'auth/internal-error' ||
      errMsg.includes('closing') ||
      errMsg.includes('hidden') ||
      errMsg.includes('IndexedDB')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const registerWithEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot };
export type { User };

