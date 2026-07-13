"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  orders: any[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileDetails: (name: string, phone: string, address: string) => Promise<void>;
  addOrder: (order: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isSigningUpRef = React.useRef(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        try {
          if (currentUser) {
            if (isSigningUpRef.current) {
              setUser(currentUser);
              return;
            }
            // Load custom user profile from localStorage namespace
            const savedProfile = localStorage.getItem(`kamta_wise_profile_${currentUser.uid}`);
            if (savedProfile) {
              try {
                setUser(currentUser);
                setProfile(JSON.parse(savedProfile));
              } catch (e) {
                console.error("Error loading saved user profile", e);
              }
            } else {
              // Try Firestore first
              const docRef = doc(db, "users", currentUser.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                localStorage.setItem(`kamta_wise_profile_${currentUser.uid}`, JSON.stringify(data));
                setUser(currentUser);
                setProfile(data);
              } else {
                // First-time user detected with no profile. Reject session.
                setUser(null);
                setProfile(null);
                await auth.signOut();
                alert("Account profile not found. Please sign up first using Email & Password to create your account.");
              }
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (e) {
          console.error("Error in onAuthStateChanged observer callback:", e);
        } finally {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up onAuthStateChanged observer:", err);
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time profile changes in Firestore (e.g. order status updates by admin)
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          localStorage.setItem(`kamta_wise_profile_${user.uid}`, JSON.stringify(data));
          setProfile(data);
        }
      },
      (err) => {
        console.error("Error subscribing to real-time user profile updates:", err);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setIsAuthModalOpen(false);
  };

  const signUp = async (name: string, email: string, password: string, phone = "", address = "") => {
    isSigningUpRef.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        // Force reload to apply displayName updates immediately
        await userCredential.user.reload();
        const freshUser = auth.currentUser;

        const newProfile: UserProfile = {
          name,
          email,
          phone,
          address,
          orders: [],
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`kamta_wise_profile_${userCredential.user.uid}`, JSON.stringify(newProfile));
        await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
        
        setUser(freshUser);
        setProfile(newProfile);
      }
    } finally {
      isSigningUpRef.current = false;
    }
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      if (googleUser) {
        const docRef = doc(db, "users", googleUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // New user using Google. Sign out and clean up auth credentials.
          await auth.signOut();
          try {
            await googleUser.delete();
          } catch (delErr) {
            console.error("Error cleaning up user:", delErr);
          }
          setUser(null);
          setProfile(null);
          alert("Google Sign-In is only allowed for users who have already registered using Email & Password. Please Sign Up first.");
          return;
        } else {
          const data = docSnap.data() as UserProfile;
          localStorage.setItem(`kamta_wise_profile_${googleUser.uid}`, JSON.stringify(data));
          setUser(googleUser);
          setProfile(data);
        }
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/operation-not-allowed") {
        alert("Google Sign-In is not enabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Google.");
      } else if (err.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized for Google Sign-In. Please add your current domain under Firebase Console > Authentication > Settings > Authorized domains.");
      } else if (err.code === "auth/popup-closed-by-user") {
        console.log("User closed Google Sign-In popup.");
      } else {
        alert(err.message || "Google Sign-In failed. Please try again.");
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileDetails = async (name: string, phone: string, address: string) => {
    if (!user) return;
    await updateProfile(user, {
      displayName: name,
    });
    await user.reload();
    setUser(auth.currentUser);

    const updated = {
      name,
      email: profile?.email || user.email || "",
      phone,
      address,
      orders: profile?.orders || [],
    };
    localStorage.setItem(`kamta_wise_profile_${user.uid}`, JSON.stringify(updated));
    setProfile(updated);
    await setDoc(doc(db, "users", user.uid), updated, { merge: true });
  };

  const addOrder = async (order: any) => {
    if (!user) return;
    const updatedOrders = profile ? [order, ...profile.orders] : [order];
    const updated = {
      name: profile?.name || user.displayName || "",
      email: profile?.email || user.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      orders: updatedOrders
    };
    localStorage.setItem(`kamta_wise_profile_${user.uid}`, JSON.stringify(updated));
    setProfile(updated);

    // Write updated profile with orders array to Firestore
    await setDoc(doc(db, "users", user.uid), updated, { merge: true });

    // Write individual order to orders subcollection and top-level orders collection
    const orderId = order.orderNumber ? order.orderNumber.replace("#", "") : `order-${Date.now()}`;
    const orderWithCreatedAt = {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      userName: profile?.name || user.displayName || "Guest Customer",
      userEmail: profile?.email || user.email || ""
    };
    await setDoc(doc(db, "users", user.uid, "orders", orderId), orderWithCreatedAt);
    await setDoc(doc(db, "orders", orderId), { ...orderWithCreatedAt, userId: user.uid });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        profile,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfileDetails,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
