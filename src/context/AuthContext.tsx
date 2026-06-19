'use client';

import React, { createContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

export interface NormalizedUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: NormalizedUser | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: any } | void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ user: any; error: any }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ user: any; error: any }>;
  logout: () => Promise<{ error: any } | void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ user: null, error: null }),
  signUpWithEmail: async () => ({ user: null, error: null }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Get role from Firestore users collection
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userRole: 'admin' | 'user' = 'user';
          
          if (userDocSnap.exists()) {
            userRole = userDocSnap.data().role === 'admin' ? 'admin' : 'user';
          } else {
            // Document doesn't exist yet, we initialize it
            userRole = firebaseUser.email === 'admin@chronoearth.ai' ? 'admin' : 'user';
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userRole,
              createdAt: serverTimestamp()
            });

            // Sync user to Supabase profiles & user_roles as well, so queries/joins work!
            const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '';
            const avatarUrl = firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.email || firebaseUser.uid}`;

            await supabase.from('profiles').upsert({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: fullName,
              avatar_url: avatarUrl
            });

            await supabase.from('user_roles').upsert({
              user_id: firebaseUser.uid,
              role: userRole
            });
            
            await supabase.from('user_preferences').upsert({
              user_id: firebaseUser.uid,
              selected_theme: 'cyber',
              default_timeline: 2050
            });
          }

          // 2. Set normalized user object
          const normUser: NormalizedUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            user_metadata: {
              full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              avatar_url: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.email || firebaseUser.uid}`
            }
          };
          
          setUser(normUser);
          setRole(userRole);

          // 3. Set cookies for middleware
          document.cookie = `fb-access-token=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
          document.cookie = `fb-user-role=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;

        } catch (err) {
          console.error('Auth state change resolution error:', err);
          clearState();
        }
      } else {
        clearState();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearState = () => {
    setUser(null);
    setRole(null);
    // Clear cookies
    document.cookie = 'fb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
    document.cookie = 'fb-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
  };

  // Email + Password Sign Up Flow
  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Profile display name and default avatar
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`;
      await updateProfile(firebaseUser, {
        displayName: fullName,
        photoURL: avatarUrl
      });
      
      // Force write to Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userRole: 'admin' | 'user' = email === 'admin@chronoearth.ai' ? 'admin' : 'user';
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: email,
        role: userRole,
        createdAt: serverTimestamp()
      });

      // Sync user to Supabase
      await supabase.from('profiles').upsert({
        id: firebaseUser.uid,
        email: email,
        full_name: fullName,
        avatar_url: avatarUrl
      });

      await supabase.from('user_roles').upsert({
        user_id: firebaseUser.uid,
        role: userRole
      });

      await supabase.from('user_preferences').upsert({
        user_id: firebaseUser.uid,
        selected_theme: 'cyber',
        default_timeline: 2050
      });

      return { user: firebaseUser, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  };

  // Email + Password Sign In Flow
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return { user: userCredential.user, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  };

  // Google Login Flow
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      return { error: err };
    }
  };

  // Secure Logout Flow
  const logout = async () => {
    try {
      await signOut(auth);
      clearState();
    } catch (err: any) {
      clearState();
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
