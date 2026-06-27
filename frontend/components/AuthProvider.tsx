"use client";

import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, onSnapshot } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db, googleProvider, initAnalytics } from "@/lib/firebase";

type ProfilePayload = {
  name?: string;
  username?: string;
  password?: string;
  profession?: string;
  workStart?: string;
  workEnd?: string;
  deepWorkHours?: string;
  theme?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: any;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  saveUserProfile: (payload?: ProfilePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAnalytics().catch(() => null);
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (nextUser) {
        unsubProfile = onSnapshot(doc(db, "users", nextUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Profile fetch failed:", err);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const saveUserProfile = useCallback(async (payload: ProfilePayload = {}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const dataToSave: any = {
      uid: currentUser.uid,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      provider: "google",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    if (payload.name !== undefined) {
      dataToSave.name = payload.name;
    } else if (currentUser.displayName) {
      dataToSave.name = currentUser.displayName;
    }

    if (payload.username !== undefined) {
      dataToSave.username = payload.username;
    }

    if (payload.password !== undefined) {
      dataToSave.password = payload.password;
    }

    const preferences: any = {};
    if (payload.profession !== undefined) preferences.profession = payload.profession;
    if (payload.workStart !== undefined) preferences.workStart = payload.workStart;
    if (payload.workEnd !== undefined) preferences.workEnd = payload.workEnd;
    if (payload.deepWorkHours !== undefined) preferences.deepWorkHours = payload.deepWorkHours;
    if (payload.theme !== undefined) preferences.theme = payload.theme;

    if (Object.keys(preferences).length > 0) {
      dataToSave.preferences = preferences;
    }

    await setDoc(
      doc(db, "users", currentUser.uid),
      dataToSave,
      { merge: true }
    );
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserProfile().catch((error) => {
        console.warn("Signed in, but profile sync failed:", error);
      });
      return result.user;
    } catch (error) {
      console.warn("signInWithPopup blocked or failed. Falling back to signInWithRedirect:", error);
      await signInWithRedirect(auth, googleProvider);
      return new Promise<User>(() => {}); // Hold execution until redirect initiates
    }
  }, [saveUserProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signInWithGoogle,
      signOut: () => firebaseSignOut(auth),
      saveUserProfile
    }),
    [user, profile, loading, signInWithGoogle, saveUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
