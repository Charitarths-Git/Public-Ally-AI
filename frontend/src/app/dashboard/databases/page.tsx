"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DatabasesPage from '@/components/pages/DatabasesPage';

export default function Databases() {
  const router = useRouter();
  const [accentColor, setAccentColor] = useState('#1976D2');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsedSession = JSON.parse(session);
      const isGovernanceTheme = parsedSession.theme === 'governance';
      setAccentColor(isGovernanceTheme ? '#001f3f' : '#1976D2');
    } else {
      router.push('/');
    }
  }, [router]);

  return <DatabasesPage accentColor={accentColor} />;
}
