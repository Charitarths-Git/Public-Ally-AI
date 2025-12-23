"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KnowledgeBasePage from '@/components/pages/KnowledgeBasePage';

export default function KnowledgeBase() {
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

  return <KnowledgeBasePage accentColor={accentColor} />;
}
