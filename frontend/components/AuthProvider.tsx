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
  workingStyle?: string;
  preferredSessionLength?: string;
  maxDailyDeepWork?: string;
  maxTotalWork?: string;
  weekendAvailability?: boolean;
  lunchStart?: string;
  lunchEnd?: string;
  meetingHeavy?: boolean;
  notificationPreference?: string;
  calendarStrictness?: string;
  procrastinationLevel?: string;
  averageSleep?: string;
  stressLevel?: string;
  riskTolerance?: string;
  taskSwitchingAbility?: string;
  contextSwitchingCost?: string;
  breakFrequency?: string;
  focusRecoveryTime?: string;
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
    if (payload.deepWorkHours !== undefined) preferences.deepWorkHours = Number(payload.deepWorkHours);
    if (payload.theme !== undefined) preferences.theme = payload.theme;
    if (payload.workingStyle !== undefined) preferences.workingStyle = payload.workingStyle;
    if (payload.preferredSessionLength !== undefined) preferences.preferredSessionLength = Number(payload.preferredSessionLength);
    if (payload.maxDailyDeepWork !== undefined) preferences.maxDailyDeepWork = Number(payload.maxDailyDeepWork);
    if (payload.maxTotalWork !== undefined) preferences.maxTotalWork = Number(payload.maxTotalWork);
    if (payload.weekendAvailability !== undefined) preferences.weekendAvailability = payload.weekendAvailability;
    if (payload.lunchStart !== undefined) preferences.lunchStart = payload.lunchStart;
    if (payload.lunchEnd !== undefined) preferences.lunchEnd = payload.lunchEnd;
    if (payload.meetingHeavy !== undefined) preferences.meetingHeavy = payload.meetingHeavy;
    if (payload.notificationPreference !== undefined) preferences.notificationPreference = payload.notificationPreference;
    if (payload.calendarStrictness !== undefined) preferences.calendarStrictness = Number(payload.calendarStrictness);
    if (payload.procrastinationLevel !== undefined) preferences.procrastinationLevel = Number(payload.procrastinationLevel);
    if (payload.averageSleep !== undefined) preferences.averageSleep = Number(payload.averageSleep);
    if (payload.stressLevel !== undefined) preferences.stressLevel = payload.stressLevel;
    if (payload.riskTolerance !== undefined) preferences.riskTolerance = payload.riskTolerance;
    if (payload.taskSwitchingAbility !== undefined) preferences.taskSwitchingAbility = payload.taskSwitchingAbility;
    if (payload.contextSwitchingCost !== undefined) preferences.contextSwitchingCost = Number(payload.contextSwitchingCost);
    if (payload.breakFrequency !== undefined) preferences.breakFrequency = Number(payload.breakFrequency);
    if (payload.focusRecoveryTime !== undefined) preferences.focusRecoveryTime = Number(payload.focusRecoveryTime);

    if (Object.keys(preferences).length > 0) {
      dataToSave.preferences = preferences;
      // Initialize matching metrics
      dataToSave.metrics = {
        averageCompletionRate: 0.85,
        averageDelayHours: 0.5,
        deepWorkCapacity: Number(payload.deepWorkHours || 4),
        burnoutScore: 15,
        reliabilityScore: 88,
        focusScore: 82,
        planningAccuracy: 0.90
      };
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
