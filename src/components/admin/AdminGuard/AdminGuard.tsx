'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    // Mismo criterio que el middleware: sin sesión, al login; con sesión pero
    // sin rol ADMIN, a home (no tiene sentido reabrir el login).
    if (!user) {
      router.replace('/?authRequired=1');
    } else if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [hydrated, user, router]);

  // Evita parpadear contenido de admin antes de confirmar sesión + rol.
  if (!hydrated || !user || user.role !== 'ADMIN') return null;

  return <>{children}</>;
}