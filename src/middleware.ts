import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Authentication routes that should be accessible only to unauthenticated users
const authRoutes = ["/signin", "/signup"];

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/voice-models",
  "/stories",
  "/projects",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get the user's session token using NextAuth
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });
  
  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // If the route is an auth route and the user is authenticated, redirect to dashboard
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // If the route is a protected route and the user is not authenticated, redirect to signin
  if (!isAuthenticated && 
      (protectedRoutes.some(route => pathname.startsWith(route)) || 
       pathname.includes("dashboard"))) {
    // Store the intended URL to redirect after login
    const url = new URL("/signin", req.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If none of the conditions match, continue to the requested page
  return NextResponse.next();
}

// Configure matcher to ensure middleware only runs on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (static files)
     * 4. /images (static files)
     * 5. favicon.ico, sitemap.xml, robots.txt (static files)
     */
    "/((?!api|_next|fonts|images|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}; 