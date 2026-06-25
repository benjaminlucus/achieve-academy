import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Zoom App Credentials from Environment Variables
    const clientId = process.env.ZOOM_CLIENT_ID;
    const redirectUri = process.env.ZOOM_REDIRECT_URL;

    if (!clientId || !redirectUri) {
      console.error("Missing Zoom environment variables", { clientId: !!clientId, redirectUri: !!redirectUri });
      return new NextResponse("Zoom Configuration Error: Missing Client ID or Redirect URL", { status: 500 });
    }

    // 2. Generate a random state string for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");

    // 3. Store state in a secure, HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("zoom_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // 4. Construct Zoom Authorization URL
    const zoomAuthUrl = new URL("https://zoom.us/oauth/authorize");
    zoomAuthUrl.searchParams.append("response_type", "code");
    zoomAuthUrl.searchParams.append("client_id", clientId);
    zoomAuthUrl.searchParams.append("redirect_uri", redirectUri);
    zoomAuthUrl.searchParams.append("state", state);

    // 5. Redirect user to Zoom
    return NextResponse.redirect(zoomAuthUrl.toString());
  } catch (error) {
    console.error("Zoom Auth Initiation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
