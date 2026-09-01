'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    // Ya no existe una pagina de login dedicada: mandamos a home y el
    // Header abre el sidebar de acceso automaticamente (ver Header.tsx).
    if (!user) router.replace('/?authRequired=1');
  }, [hydrated, user, router]);

  // Evita parpadear contenido protegido antes de confirmar que no hay sesión.
  if (!hydrated || !user) return null;

  return <>{children}</>;
}