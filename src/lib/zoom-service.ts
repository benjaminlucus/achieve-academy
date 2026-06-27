/**
 * Zoom Service Utility
 * 
 * This service handles Zoom-related logic, including URL validation,
 * token management, and automated meeting creation.
 */
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { decrypt, encrypt } from "./encryption";
import { logger } from "./logger";

export const ZOOM_URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)?zoom\.(us|com)\/(j|my|s)\/[\d\w?=&._-]+$/i;

/**
 * Validates if a string is a proper Zoom meeting URL
 */
export const isValidZoomUrl = (url: string): boolean => {
  if (!url) return false;
  return ZOOM_URL_REGEX.test(url);
};

/**
 * Interface for Zoom meeting details
 * This matches the structure we want to save in our database
 */
export interface ZoomMeetingDetails {
  meetingId: string;
  joinUrl: string;
  hostUrl?: string;
  duration?: number;
  startTime?: Date;
  provider: "zoom";
}

/**
 * Refreshes a Zoom access token using the refresh token
 */
async function refreshAccessToken(clerkId: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ clerkId });

  if (!user || !user.zoomConnected || !user.zoomEncryptedRefreshToken) {
    throw new Error("Zoom not connected");
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Zoom credentials");
  }

  const refreshToken = decrypt(user.zoomEncryptedRefreshToken);
  const tokenUrl = "https://zoom.us/oauth/token";

  const tokenParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams,
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Failed to refresh Zoom token", { error });
    throw new Error("Failed to refresh Zoom token");
  }

  const tokenData = await response.json();

  // Update user with new tokens
  const encryptedAccessToken = encrypt(tokenData.access_token);
  const encryptedRefreshToken = encrypt(tokenData.refresh_token);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        zoomEncryptedAccessToken: encryptedAccessToken,
        zoomEncryptedRefreshToken: encryptedRefreshToken,
        zoomTokenExpiresAt: expiresAt,
      },
    }
  );

  return tokenData.access_token;
}

/**
 * Gets a valid access token, refreshing if needed
 */
export async function getValidAccessToken(clerkId: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ clerkId });

  if (!user || !user.zoomConnected || !user.zoomEncryptedAccessToken) {
    throw new Error("Zoom not connected");
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (user.zoomTokenExpiresAt) {
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    if (user.zoomTokenExpiresAt.getTime() < fiveMinutesFromNow) {
      return refreshAccessToken(clerkId);
    }
  }

  return decrypt(user.zoomEncryptedAccessToken);
}

/**
 * Creates a Zoom meeting using the Zoom API
 */
export const createZoomMeeting = async (
  clerkId: string,
  topic: string,
  startTime: Date,
  duration: number = 30
): Promise<ZoomMeetingDetails> => {
  const accessToken = await getValidAccessToken(clerkId);

  const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime.toISOString(),
      duration,
      timezone: "UTC",
      settings: {
        join_before_host: true,
        waiting_room: false,
        participant_video: true,
        host_video: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Failed to create Zoom meeting", { error });
    throw new Error("Failed to create Zoom meeting");
  }

  const meeting = await response.json();

  return {
    meetingId: meeting.id.toString(),
    joinUrl: meeting.join_url,
    hostUrl: meeting.start_url,
    duration,
    startTime,
    provider: "zoom",
  };
};

/**
 * Formats a manual Zoom link into our standard meeting details structure
 */
export const formatManualZoomMeeting = (url: string, duration: number = 30): ZoomMeetingDetails => {
  const meetingIdMatch = url.match(/\/j\/(\d+)/);
  const meetingId = meetingIdMatch ? meetingIdMatch[1] : "manual-" + Date.now();

  return {
    meetingId,
    joinUrl: url,
    hostUrl: url,
    duration,
    provider: "zoom",
  };
};
