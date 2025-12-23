"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultsPage from '@/components/pages/ResultsPage';

export default function Results() {
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

  return <ResultsPage accentColor={accentColor} />;
}
