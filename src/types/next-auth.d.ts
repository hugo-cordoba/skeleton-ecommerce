import type { DefaultSession, DefaultUser } from 'next-auth';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}