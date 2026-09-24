import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const STUDENT_COOKIE = "kaolo_session";
const ADMIN_COOKIE = "kaolo_admin_session";

function secretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
}

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

const STUDENT_PROTECTED = ["/level", "/purchases", "/viewer", "/checkout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await isValid(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (STUDENT_PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const token = request.cookies.get(STUDENT_COOKIE)?.value;
    if (!(await isValid(token))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/level/:path*", "/purchases/:path*", "/viewer/:path*", "/checkout/:path*", "/admin/:path*"],
};
