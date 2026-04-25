import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { getCurrentUser } from './lib/utils';
import { NextResponse } from 'next/server';

// 1. Routes that don't need login
const isPublicRoute = createRouteMatcher([
  '/', 
  '/contact', 
  '/about', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api(.*)'
]);

// Specifically match public profiles but NOT dashboards
const isPublicProfileRoute = createRouteMatcher([
  '/students/:id',
  '/tutors/:id'
]);

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/students/:id/dashboard(.*)',
  '/tutors/:id/dashboard(.*)'
]);

// 2. The Onboarding Page
const isOnboardingRoute = createRouteMatcher(['/onboarding']);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);

  // PASS 1: If not logged in and trying to access a private route
  if (!userId && !isPublicRoute(req) && !isPublicProfileRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // PASS 2: If logged in
  if (userId) {
    const user = await getCurrentUser();
    
    // Security: Only 'admin' role can access admin routes
    if (isAdminRoute(req) && user?.role !== 'admin') {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const hasFinishedOnboarding = user?.role === "student" || user?.role === "tutor" || user?.role === "admin" || user?.isOnboarded;

    // REDIRECT A: Not onboarded and trying to go to dashboard or other private areas
    // Note: Admins bypass this if they are already marked as admin in DB
    if (!hasFinishedOnboarding && !isOnboardingRoute(req) && !isPublicRoute(req) && !isPublicProfileRoute(req)) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // REDIRECT B: Already onboarded but trying to go back to /onboarding
    if (hasFinishedOnboarding && isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ACCESS CONTROL: Private Dashboards
    if (isDashboardRoute(req)) {
      const pathSegments = url.pathname.split('/');
      if (pathSegments.length >= 4 && pathSegments[3] === 'dashboard') {
        const profileId = pathSegments[2];
        // Allow the user themselves OR an admin to see the private dashboard
        if (user?._id.toString() !== profileId && user?.role !== 'admin') {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}