import { useRouter, useSegments } from "expo-router";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/constants/firebase';

interface Session {
  session: string | null;
  isLoading: boolean;
}

const AuthContext = React.createContext<Session>({ session: null, isLoading: true });

export function useSession() {
  return React.useContext(AuthContext);
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setSession(user.uid);
        router.replace('/(tabs)');
      } else {
        setSession(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {props.children}
    </AuthContext.Provider>
  );
}
