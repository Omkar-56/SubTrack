'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, setAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    } else {
      setAuthModal('login');
      router.replace('/');
    }
  }, [user, setAuthModal, router]);

  return null;
}
