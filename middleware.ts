// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hackhabit_auth")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    token &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * 1. api (rutas de API)
     * 2. _next/static (archivos estáticos)
     * 3. _next/image (optimización de imágenes)
     * 4. favicon.ico (icono)
     * 5. public (carpeta de assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
