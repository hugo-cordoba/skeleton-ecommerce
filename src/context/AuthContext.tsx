'use client';

import { createContext, useContext, useEffect, useReducer, useState } from 'react';

const AUTH_STORAGE_KEY = 'ecommerce-landing:auth';
const USERS_STORAGE_KEY = 'ecommerce-landing:users';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

interface StoredUser extends AuthUser {
  // NOTA: password en claro en localStorage es SOLO para este skeleton.
  // Sustituir por autenticacion real (hash + backend) antes de produccion.
  password: string;
}

type AuthAction = { type: 'HYDRATE' | 'SET_USER'; payload: AuthUser | null };

function authReducer(state: AuthUser | null, action: AuthAction): AuthUser | null {
  switch (action.type) {
    case 'HYDRATE':
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
}

function readUsers(): StoredUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (fullName: string, email: string, password: string) => AuthResult;
  logout: () => void;
  updateProfile: (data: { fullName: string; email: string }) => AuthResult;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, dispatch] = useReducer(authReducer, null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as AuthUser });
    } catch {
      // sesion corrupta o no disponible: seguimos sin sesion.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user, hydrated]);

  function login(email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = readUsers().find((candidate) => candidate.email === normalizedEmail);

    if (!existing || existing.password !== password) {
      return { ok: false, error: 'Email o contraseña incorrectos.' };
    }

    dispatch({
      type: 'SET_USER',
      payload: { id: existing.id, fullName: existing.fullName, email: existing.email },
    });
    return { ok: true };
  }

  function register(fullName: string, email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.some((candidate) => candidate.email === normalizedEmail)) {
      return { ok: false, error: 'Ya existe una cuenta con ese email.' };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now().toString(36)}`,
      fullName,
      email: normalizedEmail,
      password,
    };

    writeUsers([...users, newUser]);
    dispatch({
      type: 'SET_USER',
      payload: { id: newUser.id, fullName: newUser.fullName, email: newUser.email },
    });
    return { ok: true };
  }

  function logout() {
    dispatch({ type: 'SET_USER', payload: null });
  }

  function updateProfile(data: { fullName: string; email: string }): AuthResult {
    if (!user) return { ok: false, error: 'No hay sesión activa.' };

    const normalizedEmail = data.email.trim().toLowerCase();
    const users = readUsers();

    if (users.some((candidate) => candidate.email === normalizedEmail && candidate.id !== user.id)) {
      return { ok: false, error: 'Ya existe una cuenta con ese email.' };
    }

    writeUsers(
      users.map((candidate) =>
        candidate.id === user.id ? { ...candidate, fullName: data.fullName, email: normalizedEmail } : candidate
      )
    );
    dispatch({ type: 'SET_USER', payload: { ...user, fullName: data.fullName, email: normalizedEmail } });
    return { ok: true };
  }

  const value: AuthContextValue = { user, hydrated, login, register, logout, updateProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  return context;
}