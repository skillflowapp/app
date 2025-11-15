import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/constants/firebase';

interface Session {
  session: string | null;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = React.createContext<Session>({ session: null, isLoading: true, user: null });

export function useSession() {
  return React.useContext(AuthContext);
}

export default function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setSession(user.uid);
        setUser(user);
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {props.children}
    </AuthContext.Provider>
  );
}
