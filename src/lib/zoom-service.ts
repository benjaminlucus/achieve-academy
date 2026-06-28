/**
 * Zoom Service Utility
 * 
 * This service handles Zoom-related logic, including URL validation,
 * token management, and automated meeting creation.
 */
import { logger } from "./logger";

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
  provider: "zoom";
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
  topic: string,
  startTime: Date,
  duration: number = 60
): Promise<ZoomMeetingDetails> => {
  const accessToken = await getPlatformZoomAccessToken();

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
