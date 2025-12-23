"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '@/types';

interface SessionContextType {
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  accentColor: string;
  secondaryColor: string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userSession, setUserSessionState] = useState<UserSession | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      setUserSessionState(JSON.parse(session));
    }
  }, []);

  const setUserSession = (session: UserSession | null) => {
    if (session) {
      localStorage.setItem('userSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('userSession');
    }
    setUserSessionState(session);
  };

  const isGovernanceTheme = userSession?.theme === 'governance';
  const accentColor = isGovernanceTheme ? '#001f3f' : '#1976D2';
  const secondaryColor = isGovernanceTheme ? '#138808' : '#64B5F6';

  return (
    <SessionContext.Provider value={{ userSession, setUserSession, accentColor, secondaryColor }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
