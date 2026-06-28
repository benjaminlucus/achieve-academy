import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { encrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Get stored state from cookie
    const cookieStore = await cookies();
    const storedState = cookieStore.get("zoom_auth_state")?.value;

    // Verify state to prevent CSRF
    if (!state || !storedState || state !== storedState) {
      logger.error("Zoom OAuth state mismatch", { receivedState: !!state, storedState: !!storedState });
      return new NextResponse("Invalid state parameter", { status: 400 });
    }

    if (!code) {
      logger.error("Zoom OAuth missing code");
      return new NextResponse("Missing authorization code", { status: 400 });
    }

    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = process.env.ZOOM_REDIRECT_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      logger.error("Missing Zoom environment variables for callback");
      return new NextResponse("Zoom Configuration Error", { status: 500 });
    }

    // Exchange code for tokens
    const tokenUrl = "https://zoom.us/oauth/token";
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error("Failed to exchange code for tokens", {
        status: tokenResponse.status,
        error: errorText,
      });
      return new NextResponse("Failed to authenticate with Zoom", { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Get Zoom user info
    const userResponse = await fetch("https://api.zoom.us/v2/users/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      logger.error("Failed to get Zoom user info", { status: userResponse.status });
      return new NextResponse("Failed to get Zoom user info", { status: 500 });
    }

    const zoomUser = await userResponse.json();

    // Connect to DB and save tokens
    await connectDB();
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          zoomConnected: true,
          zoomUserId: zoomUser.id,
          zoomEncryptedAccessToken: encryptedAccessToken,
          zoomEncryptedRefreshToken: encryptedRefreshToken,
          zoomTokenExpiresAt: expiresAt,
        },
      },
      { new: true }
    );

    logger.info("Zoom OAuth successful", { clerkId: userId, zoomUserId: zoomUser.id });

    // Redirect back to admin dashboard
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    logger.error("Zoom OAuth callback error", { error });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
