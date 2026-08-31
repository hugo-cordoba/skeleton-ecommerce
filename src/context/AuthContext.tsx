'use client';

import { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Role } from '@prisma/client';
import { registerUser, updateProfileAction } from '@/lib/actions/auth.actions';
import { mergeGuestCartIntoUserAction, clearGuestSessionAction } from '@/lib/actions/cart.actions';
import { mergeGuestWishlistIntoUserAction } from '@/lib/actions/wishlist.actions';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (data: { fullName: string; email: string }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();

  const hydrated = status !== 'loading';
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        fullName: session.user.name ?? '',
        email: session.user.email ?? '',
        role: session.user.role,
      }
    : null;

  async function login(email: string, password: string): Promise<AuthResult> {
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) return { ok: false, error: 'Email o contraseña incorrectos.' };

    await mergeGuestCartIntoUserAction();
    await mergeGuestWishlistIntoUserAction();
    await clearGuestSessionAction();

    return { ok: true };
  }

  async function register(fullName: string, email: string, password: string): Promise<AuthResult> {
    const result = await registerUser(fullName, email, password);
    if (!result.ok) return result;
    return login(email, password);
  }

  function logout() {
    signOut({ redirect: false });
  }

  async function updateProfile(data: { fullName: string; email: string }): Promise<AuthResult> {
    if (!user) return { ok: false, error: 'No hay sesión activa.' };
    const result = await updateProfileAction(user.id, data);
    if (result.ok) await update();
    return result;
  }

  const value: AuthContextValue = { user, hydrated, login, register, logout, updateProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  return context;
}