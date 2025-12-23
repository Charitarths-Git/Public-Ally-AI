"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '@/components/pages/HomePage';
import { UserSession } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [accentColor, setAccentColor] = useState('#1976D2');
  const [secondaryColor, setSecondaryColor] = useState('#64B5F6');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsedSession = JSON.parse(session);
      setUserSession(parsedSession);
      
      const isGovernanceTheme = parsedSession.theme === 'governance';
      setAccentColor(isGovernanceTheme ? '#001f3f' : '#1976D2');
      setSecondaryColor(isGovernanceTheme ? '#138808' : '#64B5F6');
    } else {
      router.push('/');
    }
  }, [router]);

  if (!userSession) {
    return null;
  }

  return <HomePage userSession={userSession} accentColor={accentColor} secondaryColor={secondaryColor} />;
}
