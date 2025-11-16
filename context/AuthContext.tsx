import { auth, db } from '@/constants/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserProfile extends User {
  bio?: string;
  role?: string;
  department?: string;
  phone?: string;
}

interface AuthContextType {
  session: UserProfile | null;
  isLoading: boolean;
  setSession: (session: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  setSession: () => {},
  refreshProfile: async () => {},
});

export function useSession() {
  return useContext(AuthContext);
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSessionFromFirestore = async (userId: string, currentUser: User) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      let userProfile: UserProfile = { 
        ...currentUser, 
        bio: '', 
        role: 'student',
        displayName: currentUser.displayName || '',
        department: '',
        phone: '',
      };
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        userProfile.bio = data?.bio || '';
        userProfile.role = data?.role || 'student';
        userProfile.department = data?.department || '';
        userProfile.phone = data?.phone || '';
        if (data?.displayName) {
          userProfile.displayName = data.displayName;
        }
      }
      
      setSession(userProfile);
      return userProfile;
    } catch (error) {
      console.warn('Error fetching profile from Firestore:', error);
      // Still set session with basic user info even if Firestore read fails
      const userProfile: UserProfile = {
        ...currentUser,
        bio: '',
        role: 'student',
        displayName: currentUser.displayName || '',
        department: '',
        phone: '',
      };
      setSession(userProfile);
      return userProfile;
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await updateSessionFromFirestore(auth.currentUser.uid, auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await updateSessionFromFirestore(user.uid, user);
        
        // Set up real-time listener for Firestore profile changes
        const docRef = doc(db, 'profiles', user.uid);
        const unsubscribeSnapshot = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setSession((prevSession) => {
                if (!prevSession) return prevSession;
                return {
                  ...prevSession,
                  bio: data?.bio || prevSession.bio,
                  role: data?.role || prevSession.role,
                  department: data?.department || prevSession.department,
                  phone: data?.phone || prevSession.phone,
                  displayName: data?.displayName || prevSession.displayName,
                };
              });
            }
          },
          (error) => {
            // Handle permission errors gracefully
            console.warn('Firestore listener error (this may be a permission issue):', error.message);
          }
        );
        
        setIsLoading(false);
        return unsubscribeSnapshot;
      } else {
        setSession(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    session,
    isLoading,
    setSession,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}
