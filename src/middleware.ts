import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Jika user mencoba masuk ke dashboard/admin/client tanpa login
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/client") ||
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Jika user sudah login tapi mencoba akses halaman login/register
  if (token && (pathname === "/login" || pathname === "/register")) {
    const role = (token as any).role;
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    } else if (role === "CLIENT") {
      return NextResponse.redirect(new URL("/client", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/dashboard/:path*", "/login", "/register"],
};
