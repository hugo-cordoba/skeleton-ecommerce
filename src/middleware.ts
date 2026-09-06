import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

/**
 * `authorized` decide si se deja pasar la petición o se manda a `pages.signIn`
 * (solo comprueba que exista sesión, para cualquier ruta del matcher). La
 * función de abajo solo se ejecuta cuando `authorized` ya dio luz verde, así
 * que ahí añadimos la comprobación extra de rol para `/admin`: si hay sesión
 * pero no es ADMIN, no tiene sentido reabrir el login (ya está logueado), así
 * que lo mandamos a la home en vez de dejarle pasar.
 */
export default withAuth(
  function middleware(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const role = req.nextauth.token?.role;

    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/' },
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
    '/admin/:path*',
  ],
};