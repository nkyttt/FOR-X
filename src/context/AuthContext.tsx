import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseAuthErrorMessage } from '../lib/authErrors';

interface AuthContextType {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  googleAccessToken: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  registerWithEmail: (
    name: string,
    username: string,
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; code?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  addXpAndPoints: (xp: number, points: number, reason?: string) => Promise<void>;
  toggleWishlistGame: (gameId: string) => Promise<boolean>;
  joinTournamentUser: (tournamentId: string) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Real authenticated state starts as null - NO mock users or default demo logins
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('cyberx_google_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync authenticated user profile to local storage for quick offline retrieval if needed
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cyberx_user_profile', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cyberx_user_profile');
    }
  }, [currentUser]);

  // Listen to REAL Firebase Auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              setCurrentUser(data);
            } else {
              // Create brand new standard public user profile - strictly 'USER' role
              const cleanUsername = (user.displayName || user.email?.split('@')[0] || 'player')
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .slice(0, 20);

              const newProfile: UserProfile = {
                id: user.uid,
                email: user.email || '',
                username: cleanUsername,
                displayName: user.displayName || 'CYBERX Gamer',
                avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
                role: 'USER', // Strictly USER for public signups; Admin roles remain distinct
                level: 1,
                xp: 100,
                nextLevelXp: 1000,
                cyberPoints: 200,
                bio: 'Player on CYBERX Universe. Ready to dominate the grid.',
                badges: ['b-pioneer'],
                gamesLibrary: ['cyber-strike'],
                wishlist: [],
                tournamentsJoined: [],
                createdAt: new Date().toISOString(),
                streakDays: 1,
              };

              try {
                await setDoc(userRef, newProfile);
              } catch (writeErr) {
                console.warn('Initial user profile write warning:', writeErr);
              }
              setCurrentUser(newProfile);
            }
          } catch (fetchErr) {
            console.warn('Firestore fetch user profile warning:', fetchErr);
            // Fallback user profile for authenticated session
            const fallbackProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              username: (user.displayName || user.email?.split('@')[0] || 'player').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              displayName: user.displayName || user.email?.split('@')[0] || 'Gamer',
              avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
              role: 'USER',
              level: 1,
              xp: 100,
              nextLevelXp: 1000,
              cyberPoints: 200,
              badges: ['b-pioneer'],
              gamesLibrary: ['cyber-strike'],
              wishlist: [],
              tournamentsJoined: [],
              createdAt: new Date().toISOString(),
              streakDays: 1,
            };
            setCurrentUser(fallbackProfile);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Firebase Auth listener error:', err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  // Standard throw-on-error login for admin console
  const login = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    setFirebaseUser(res.user);
    try {
      const snap = await getDoc(doc(db, 'users', res.user.uid));
      if (snap.exists()) {
        setCurrentUser(snap.data() as UserProfile);
      }
    } catch {}
    return res;
  };

  // Real Firebase Google Authentication
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
        localStorage.setItem('cyberx_google_token', token);
      }
      setFirebaseUser(result.user);
      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  };

  // Real Firebase Email/Password Sign In
  const loginWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setFirebaseUser(res.user);
      try {
        const snap = await getDoc(doc(db, 'users', res.user.uid));
        if (snap.exists()) {
          setCurrentUser(snap.data() as UserProfile);
        }
      } catch (docErr) {
        console.warn('Doc fetch warning:', docErr);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Email Sign In Error:', err);
      const errorMessage = getFirebaseAuthErrorMessage(err);
      return { success: false, error: errorMessage, code: err?.code };
    }
  };

  // Real Firebase Email/Password Registration
  const registerWithEmail = async (
    name: string,
    username: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: name.trim() });

      const cleanUsername = (username || name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 20);

      // Public Sign Up ALWAYS creates standard 'USER' role - never Admin
      const newProfile: UserProfile = {
        id: res.user.uid,
        email: email.trim(),
        username: cleanUsername,
        displayName: name.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
        role: 'USER', // Strictly USER for public accounts
        level: 1,
        xp: 100,
        nextLevelXp: 1000,
        cyberPoints: 200,
        bio: 'Welcome to CYBERX. Ready to dominate the grid.',
        badges: ['b-pioneer'],
        gamesLibrary: ['cyber-strike'],
        wishlist: [],
        tournamentsJoined: [],
        createdAt: new Date().toISOString(),
        streakDays: 1,
      };

      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      } catch (writeErr) {
        console.warn('Could not write profile to Firestore:', writeErr);
      }

      setCurrentUser(newProfile);
      setFirebaseUser(res.user);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Email Registration Error:', err);
      const errorMessage = getFirebaseAuthErrorMessage(err);
      return { success: false, error: errorMessage, code: err?.code };
    }
  };

  // Real Firebase Password Reset Email
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Password Reset Error:', err);
      const errorMessage = getFirebaseAuthErrorMessage(err);
      return { success: false, error: errorMessage };
    }
  };

  // Real Firebase Sign Out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Firebase SignOut Error:', err);
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    setGoogleAccessToken(null);
    localStorage.removeItem('cyberx_google_token');
    localStorage.removeItem('cyberx_user_profile');

    // Immediately route to /auth as required
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/auth');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), data);
      } catch (e) {
        console.warn('Firestore updateDoc warning:', e);
      }
    }
  };

  const addXpAndPoints = async (xpGain: number, pointsGain: number, reason?: string) => {
    if (!currentUser) return;
    let newXp = currentUser.xp + xpGain;
    let newLevel = currentUser.level;
    let nextLevelXp = currentUser.nextLevelXp;

    while (newXp >= nextLevelXp) {
      newXp -= nextLevelXp;
      newLevel += 1;
      nextLevelXp = Math.round(nextLevelXp * 1.25);
    }

    const updated: UserProfile = {
      ...currentUser,
      xp: newXp,
      level: newLevel,
      nextLevelXp,
      cyberPoints: currentUser.cyberPoints + pointsGain,
    };
    setCurrentUser(updated);

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          xp: newXp,
          level: newLevel,
          nextLevelXp,
          cyberPoints: updated.cyberPoints,
        });
      } catch {}
    }
  };

  const toggleWishlistGame = async (gameId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const exists = currentUser.wishlist.includes(gameId);
    const updatedWishlist = exists
      ? currentUser.wishlist.filter((id) => id !== gameId)
      : [...currentUser.wishlist, gameId];

    await updateUserProfile({ wishlist: updatedWishlist });
    return !exists;
  };

  const joinTournamentUser = async (tournamentId: string): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.tournamentsJoined.includes(tournamentId)) return true;
    const updatedTournaments = [...currentUser.tournamentsJoined, tournamentId];
    await updateUserProfile({ tournamentsJoined: updatedTournaments });
    await addXpAndPoints(150, 50, 'Joined Tournament');
    return true;
  };

  const switchDemoRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        firebaseUser,
        googleAccessToken,
        loading,
        login,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        logout,
        updateUserProfile,
        addXpAndPoints,
        toggleWishlistGame,
        joinTournamentUser,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
