import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();

  // Log all incoming requests to flight paths to debug redirects
  if (url.pathname.startsWith('/flights/')) {
    console.log(`🚀 [MIDDLEWARE] Incoming request: ${url.pathname}`);
    console.log(`🔗 [MIDDLEWARE] Full URL: ${request.url}`);
    console.log(
      `🎯 [MIDDLEWARE] User-Agent: ${request.headers
        .get('user-agent')
        ?.substring(0, 50)}...`
    );
    console.log('---');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
