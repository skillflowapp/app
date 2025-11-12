import React from 'react';

export const SessionContext = React.createContext<{ session: any; isLoading: boolean }>({ session: null, isLoading: false });

export function useSession() {
  return React.useContext(SessionContext);
}

export function SessionProvider(props: any) {
    //will be implemented later
  const [session, setSession] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {props.children}
    </SessionContext.Provider>
  );
}
