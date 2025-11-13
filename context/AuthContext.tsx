import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/constants/firebase';

type AuthSession = User | null;

interface AuthContextType {
  session: AuthSession;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<AuthSession>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
