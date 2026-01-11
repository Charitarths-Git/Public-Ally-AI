"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AboutPage from '@/components/pages/AboutPage';
import { UserSession } from '@/types';

export default function Page() {
    const router = useRouter();
    const [userSession, setUserSession] = useState<UserSession | null>(null);

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (session) {
            setUserSession(JSON.parse(session));
        } else {
            router.push('/');
        }
    }, [router]);

    if (!userSession) return null;

    const isGovernanceTheme = userSession.theme === 'governance';
    const accentColor = isGovernanceTheme ? '#001f3f' : '#1976D2';

    return <AboutPage userSession={userSession} accentColor={accentColor} />;
}
