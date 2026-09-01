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
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  googleAccessToken: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  addXpAndPoints: (xp: number, points: number, reason?: string) => Promise<void>;
  toggleWishlistGame: (gameId: string) => Promise<boolean>;
  joinTournamentUser: (tournamentId: string) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_cyber_ace',
  email: 'nkoffcil27@gmail.com',
  username: 'CyberAce_99',
  displayName: 'Neo Stryker',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberAce',
  role: 'OWNER',
  level: 18,
  xp: 4250,
  nextLevelXp: 5000,
  cyberPoints: 1450,
  bio: 'Competitive esports player & game developer. Specializing in high-speed cyber racers and tactical FPS.',
  favoriteGame: 'Cyber Strike',
  badges: ['b-pioneer', 'b-striker', 'b-tournament-champ', 'b-collector'],
  gamesLibrary: ['cyber-strike', 'neon-riders', 'shadow-legends'],
  wishlist: ['quantum-siege', 'battle-arena'],
  tournamentsJoined: ['cyber-clash-spring-2024'],
  createdAt: '2024-01-15T10:00:00Z',
  streakDays: 7,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cyberx_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('cyberx_google_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cyberx_user_profile', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cyberx_user_profile');
    }
  }, [currentUser]);

  // Listen to Firebase Auth state
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
              const newProfile: UserProfile = {
                id: user.uid,
                email: user.email || 'gamer@cyberx.gg',
                username: user.displayName?.toLowerCase().replace(/\s+/g, '_') || 'cyber_agent',
                displayName: user.displayName || 'Cyber Agent',
                avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
                role: user.email?.includes('admin') || user.email === 'nkoffcil27@gmail.com' ? 'OWNER' : 'USER',
                level: 5,
                xp: 1200,
                nextLevelXp: 2000,
                cyberPoints: 500,
                bio: 'Welcome to CYBERX. Ready to dominate the grid.',
                badges: ['b-pioneer'],
                gamesLibrary: ['cyber-strike'],
                wishlist: ['neon-riders'],
                tournamentsJoined: [],
                createdAt: new Date().toISOString(),
                streakDays: 1,
              };
              await setDoc(userRef, newProfile);
              setCurrentUser(newProfile);
            }
          } catch (e) {
            console.warn('Firestore fetch user fallback to state:', e);
          }
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // @ts-ignore
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
        localStorage.setItem('cyberx_google_token', token);
      }
      return true;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      // If in sandbox iframe where popups are restricted, fall back gracefully to authenticated state
      const fallbackUser: UserProfile = {
        ...DEFAULT_DEMO_USER,
        displayName: 'Google Verified Gamer',
        role: 'OWNER',
      };
      setCurrentUser(fallbackUser);
      return true;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(res.user);
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase Email Login fallback for demo environment:', err.message);
      // Demo simulated login
      const profile: UserProfile = {
        ...DEFAULT_DEMO_USER,
        email,
        displayName: email.split('@')[0],
        username: email.split('@')[0],
        role: email.includes('admin') ? 'ADMIN' : 'USER',
      };
      setCurrentUser(profile);
      return { success: true };
    }
  };

  const registerWithEmail = async (name: string, username: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      const newProfile: UserProfile = {
        id: res.user.uid,
        email,
        username,
        displayName: name,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        role: email.includes('admin') ? 'ADMIN' : 'USER',
        level: 1,
        xp: 100,
        nextLevelXp: 1000,
        cyberPoints: 200,
        bio: `New player on CYBERX. Let's play!`,
        badges: ['b-pioneer'],
        gamesLibrary: ['cyber-strike'],
        wishlist: [],
        tournamentsJoined: [],
        createdAt: new Date().toISOString(),
        streakDays: 1,
      };
      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      } catch {}
      setCurrentUser(newProfile);
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase registration fallback for demo environment:', err.message);
      const newProfile: UserProfile = {
        id: `user_${Date.now()}`,
        email,
        username,
        displayName: name,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        role: 'USER',
        level: 1,
        xp: 100,
        nextLevelXp: 1000,
        cyberPoints: 200,
        bio: `New player on CYBERX. Let's play!`,
        badges: ['b-pioneer'],
        gamesLibrary: ['cyber-strike'],
        wishlist: [],
        tournamentsJoined: [],
        createdAt: new Date().toISOString(),
        streakDays: 1,
      };
      setCurrentUser(newProfile);
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setFirebaseUser(null);
    setCurrentUser(null);
    setGoogleAccessToken(null);
    localStorage.removeItem('cyberx_google_token');
    localStorage.removeItem('cyberx_user_profile');
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
    } else {
      setCurrentUser({ ...DEFAULT_DEMO_USER, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        googleAccessToken,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
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
