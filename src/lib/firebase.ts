import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration from firebase-applet-config.json
export const firebaseConfig = {
  projectId: 'project-22ab824f-41be-48ac-b7f',
  appId: '1:527643928854:web:4937afc93fdb6a94e0c837',
  apiKey: 'AIzaSyAJQvhVelPGL7cwOELx5FlQSdGY1a7-Hzk',
  authDomain: 'project-22ab824f-41be-48ac-b7f.firebaseapp.com',
  storageBucket: 'project-22ab824f-41be-48ac-b7f.firebasestorage.app',
  messagingSenderId: '527643928854',
  oAuthClientId: '527643928854-v8b155rdlld2krpm2s2qgddmm3oiu69m.apps.googleusercontent.com',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// Initialize Firestore with fallback
let firestoreInstance: Firestore;
try {
  // Try with configured database ID
  firestoreInstance = getFirestore(app, 'ai-studio-cyberx-3b62fec4-42d6-4c50-a5a4-61496d8df032');
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export default app;

