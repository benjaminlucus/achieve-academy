import { clerkMiddleware, auth } from '@clerk/nextjs/server'
import { getCurrentUser } from './lib/utils';


export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId) {
    return Response.redirect(new URL("/sign-in", req.url));
  }

  const user = await getCurrentUser();

  //  If not onboarded → force onboarding
  if (!user?.data?.isOnboarded && req.nextUrl.pathname !== "/onboarding") {
    return Response.redirect(new URL("/onboarding", req.url));
  }

  //  If already onboarded → block onboarding
  if (user?.data?.isOnboarded && req.nextUrl.pathname === "/onboarding") {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  return;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
