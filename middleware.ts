import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/register", "/forgot-password", "/terms", "/privacy"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static files
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(svg|png|jpg|ico)$/)
  ) {
    return NextResponse.next()
  }

  // All other routes are protected client-side via AuthGuard.
  // The AuthGuard component checks localStorage for the JWT token
  // and redirects to /login if not authenticated.
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
