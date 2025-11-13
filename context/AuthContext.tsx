import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/constants/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface UserProfile extends User {
  bio?: string;
}

interface AuthContextType {
  session: UserProfile | null;
  isLoading: boolean;
  setSession: (session: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  setSession: () => {},
});

export function useSession() {
  return useContext(AuthContext);
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        let userProfile: UserProfile = { ...user, bio: '' };
        if (docSnap.exists()) {
          userProfile.bio = docSnap.data()?.bio || '';
        }
        setSession(userProfile);
      } else {
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    session,
    isLoading,
    setSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}
