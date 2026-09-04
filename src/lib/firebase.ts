import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

// Configuration supporting environment variables and fallback config
const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ? (import.meta as unknown as { env: Record<string, string | undefined> }).env
    : {};

// Helper to ensure databaseURL is a valid Firebase Realtime Database root URL
function getValidRtdbUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed.startsWith('https://')) return undefined;
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    // Valid Firebase Realtime Database hosts: <db-id>.firebaseio.com or <db-id>.<region>.firebasedatabase.app
    const isRtdbHost = host.endsWith('.firebaseio.com') || host.endsWith('.firebasedatabase.app');
    // Must not contain child path
    const isRoot = !parsed.pathname || parsed.pathname === '/' || parsed.pathname === '';
    if (isRtdbHost && isRoot) {
      return trimmed;
    }
  } catch {
    // Ignore invalid URL format
  }
  return undefined;
}

const validDatabaseUrl = getValidRtdbUrl(env.VITE_FIREBASE_DATABASE_URL);

export const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'project-22ab824f-41be-48ac-b7f',
  appId: env.VITE_FIREBASE_APP_ID || '1:527643928854:web:4937afc93fdb6a94e0c837',
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAJQvhVelPGL7cwOELx5FlQSdGY1a7-Hzk',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'project-22ab824f-41be-48ac-b7f.firebaseapp.com',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'project-22ab824f-41be-48ac-b7f.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '527643928854',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
  databaseURL: validDatabaseUrl,
  oAuthClientId: '527643928854-v8b155rdlld2krpm2s2qgddmm3oiu69m.apps.googleusercontent.com',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);

// Realtime Database instance (only if explicitly configured with a valid URL)
let rtdbInstance: Database | null = null;
if (validDatabaseUrl) {
  try {
    rtdbInstance = getDatabase(app, validDatabaseUrl);
  } catch (err) {
    console.warn('Realtime Database initialization skipped:', err);
  }
}
export const rtdb = rtdbInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// Auto ensure authenticated session for storage & firestore writes
export const ensureFirebaseAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous auth auto-session:', err);
    return null;
  }
};

// Initialize session in background
ensureFirebaseAuth().catch(() => {});

// Initialize Firestore
export const db: Firestore = getFirestore(app);
export default app;

