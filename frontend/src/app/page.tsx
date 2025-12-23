"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import { UserSession } from '@/types';

export default function Home() {
  const router = useRouter();
  
  const handleLogin = (session: UserSession) => {
    // Store session in localStorage for Next.js
    localStorage.setItem('userSession', JSON.stringify(session));
    router.push('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
}
