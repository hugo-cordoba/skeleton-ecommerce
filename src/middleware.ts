import { withAuth } from 'next-auth/middleware';

export default withAuth(
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
  ],
};