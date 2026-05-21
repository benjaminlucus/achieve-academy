/**
 * Zoom Service Utility
 * 
 * This service handles Zoom-related logic, including URL validation
 * and provides a structure for future automated meeting creation via Zoom API.
 */

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
 * Placeholder for future Zoom API automation
 * When implemented, this will call the Zoom API to create a meeting
 */
export const createAutomatedZoomMeeting = async (
  topic: string,
  startTime: Date,
  duration: number = 30
): Promise<ZoomMeetingDetails | null> => {
  // TODO: Implement Zoom OAuth and API integration
  // 1. Get Access Token
  // 2. POST /users/me/meetings
  // 3. Return formatted meeting details
  
  console.log("Future: Automated Zoom meeting creation for", topic);
  return null;
};

/**
 * Formats a manual Zoom link into our standard meeting details structure
 */
export const formatManualZoomMeeting = (url: string, duration: number = 30): ZoomMeetingDetails => {
  // Extract meeting ID if possible, otherwise use a placeholder or the URL itself
  const meetingIdMatch = url.match(/\/j\/(\d+)/);
  const meetingId = meetingIdMatch ? meetingIdMatch[1] : "manual-" + Date.now();

  return {
    meetingId,
    joinUrl: url,
    hostUrl: url, // For manual links, host and join link are often the same or host uses the same URL
    duration,
    provider: "zoom",
  };
};
