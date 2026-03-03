export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/api/trips/:path*', '/api/export/:path*'],
}
