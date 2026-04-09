import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { getCurrentUser } from './lib/utils';
import { NextResponse } from 'next/server';

// 1. Routes that don't need login
const isPublicRoute = createRouteMatcher([
  '/', 
  '/contact', 
  '/about', 
  '/students(.*)', 
  '/tutors(.*)', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api(.*)'
]);

// 2. The Onboarding Page
const isOnboardingRoute = createRouteMatcher(['/onboarding']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // PASS 1: If not logged in and trying to access a private route
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // PASS 2: If logged in
  if (userId) {
    // If they are on a public route (like Home or Contact), just let them through
    // This allows them to "explore" without being forced to onboard immediately.
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    const user = await getCurrentUser();
    
    // Check if onboarding is actually finished
    const hasFinishedOnboarding = user?.role === "student" || user?.role === "tutor" || user?.isOnboarded;

    // REDIRECT A: Not onboarded and trying to go to /dashboard or other private areas
    if (!hasFinishedOnboarding && !isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // REDIRECT B: Already onboarded but trying to go back to /onboarding
    if (hasFinishedOnboarding && isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // or your main landing page
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