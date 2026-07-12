/**
 * Zoom Service Utility
 * 
 * This service handles Zoom-related logic, including URL validation,
 * token management, and automated meeting creation.
 */
import { logger } from "./logger";
import { decrypt, encrypt } from "./encryption";
import User from "@/database/models/user.model";

import { generateSecureRoomName } from "./jitsi-service";

export const ZOOM_URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)?zoom\.(us|com)\/(j|my|s)\/[\d\w?=&._-]+$/i;

// Cache for server-to-server access token
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

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
  provider: "zoom" | "jitsi";
}

/**
 * Gets a valid server-to-server access token for the platform's Zoom account
 */
export async function getPlatformZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Missing Zoom server-to-server credentials");
  }

  // Check if we have a valid cached token
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 5 * 60 * 1000) {
    return cachedAccessToken.token;
  }

  // Fetch new token
  const tokenUrl = `https://zoom.us/oauth/token`;
  const tokenParams = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: accountId,
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
    logger.error("Failed to get Zoom server-to-server token", { error });
    throw new Error("Failed to get Zoom server-to-server token");
  }

  const tokenData = await response.json();

  // Cache the token
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };

  return tokenData.access_token;
}

/**
 * Creates a Zoom meeting using the platform's Zoom account
 */
export const createZoomMeeting = async (
  _topic: string,
  startTime: Date,
  duration: number = 60
): Promise<ZoomMeetingDetails> => {
  try {
    const accessToken = await getPlatformZoomAccessToken();

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "Ravencrest User Interview Session",
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
      throw new Error(error);
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
  } catch (error: any) {
    logger.error("Failed to create Zoom meeting, falling back to secure Jitsi meeting", { error: error.message });
    
    // Fallback: Generate a secure Jitsi meeting room name
    const secureRoom = generateSecureRoomName();
    return {
      meetingId: secureRoom,
      joinUrl: secureRoom,
      hostUrl: secureRoom,
      duration,
      startTime,
      provider: "jitsi",
    };
  }
};

/**
 * Gets a valid access token for a specific user's connected Zoom account,
 * automatically refreshing it if expired.
 */
export async function getUserZoomAccessToken(user: any): Promise<string> {
  if (!user.zoomConnected) {
    throw new Error("Zoom is not connected for this user");
  }

  const now = new Date();
  const tokenExpiresAt = new Date(user.zoomTokenExpiresAt);

  // If token is valid (with 5 min buffer), decrypt and return it
  if (now.getTime() < tokenExpiresAt.getTime() - 5 * 60 * 1000) {
    return decrypt(user.zoomEncryptedAccessToken);
  }

  // Token is expired, refresh it
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing Zoom client credentials");
  }

  const refreshToken = decrypt(user.zoomEncryptedRefreshToken);

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("Failed to refresh user Zoom token", { errorText });
    throw new Error("Failed to refresh Zoom token");
  }

  const tokenData = await response.json();

  const encryptedAccessToken = encrypt(tokenData.access_token);
  const encryptedRefreshToken = encrypt(tokenData.refresh_token);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  // Update in database
  await User.findByIdAndUpdate(user._id, {
    $set: {
      zoomEncryptedAccessToken: encryptedAccessToken,
      zoomEncryptedRefreshToken: encryptedRefreshToken,
      zoomTokenExpiresAt: expiresAt,
    },
  });

  return tokenData.access_token;
}

/**
 * Creates a Zoom meeting using a specific user's connected Zoom account
 */
export async function createZoomMeetingForUser(
  user: any,
  _topic: string,
  startTime: Date,
  duration: number = 60
): Promise<ZoomMeetingDetails> {
  try {
    const accessToken = await getUserZoomAccessToken(user);

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "Ravencrest User Interview Session",
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
      throw new Error(error);
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
  } catch (error: any) {
    logger.error("Failed to create Zoom meeting for connected user, falling back to platform Zoom", { error: error.message });
    // Fallback to platform-wide zoom or mock meeting
    return createZoomMeeting(_topic, startTime, duration);
  }
}

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
