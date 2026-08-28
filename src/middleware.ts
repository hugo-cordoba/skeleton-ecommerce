export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/account', '/account/orders/:path*', '/account/addresses/:path*', '/account/wishlist/:path*'],
};