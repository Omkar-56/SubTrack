'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { user, setAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    } else {
      setAuthModal('register');
      router.replace('/');
    }
  }, [user, setAuthModal, router]);

  return null;
}
