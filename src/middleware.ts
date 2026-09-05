import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const role = req.nextauth.token?.role;

    // El callback `authorized` de abajo solo exige "estar logueado".
    // Aqui añadimos la condicion extra de rol para las rutas de admin.
    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/' }, // igual que authOptions.pages.signIn
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: [
    '/account',
    '/account/orders/:path*',
    '/account/addresses/:path*',
    '/account/wishlist/:path*',
    '/admin',
    '/admin/:path*',
  ],
};