'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace('/account/login');
  }, [hydrated, user, router]);

  // Evita parpadear contenido protegido antes de confirmar que no hay sesión.
  if (!hydrated || !user) return null;

  return <>{children}</>;
}