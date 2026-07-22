import { createHmac, randomBytes } from "crypto";

/**
 * Jitsi service for generating secure meetings
 */

// Jitsi server to use - defaults to meet.jit.si
const JITSI_SERVER = process.env.JITSI_SERVER || "https://meet.jit.si";
const JITSI_JWT_SECRET = process.env.JITSI_JWT_SECRET;
const JITSI_APP_ID = process.env.JITSI_APP_ID || "ravencrest-academy";

/**
 * Generate a cryptographically secure random room name
 * Format: rca_<random-hex>
 */
export function generateSecureRoomName(): string {
  const randomPart = randomBytes(16).toString("hex");
  return `rca_${randomPart}`;
}

export interface JitsiMeeting {
  meetingId: string;
  joinUrl: string;
  hostUrl: string; // For Jitsi, both are same, but kept for consistency with Zoom
  roomName: string;
  provider: string;
}

/**
 * Base64URL encoding helper
 */
function base64url(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Sign a HS256 JWT using native Node.js crypto (zero external dependencies)
 */
export function signJitsiJwt(payload: any, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const tokenInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = createHmac("sha256", secret).update(tokenInput).digest();
  return `${tokenInput}.${base64url(signature)}`;
}

/**
 * Generate a secure classroom token and config details
 */
export function generateClassroomConfig(
  user: { _id: string; name: string; email: string; profileImage?: string },
  roomName: string,
  role: "moderator" | "participant"
) {
  const isMod = role === "moderator";
  let jwt: string | null = null;

  if (JITSI_JWT_SECRET) {
    const domain = new URL(JITSI_SERVER).host;
    const payload = {
      aud: "jitsi",
      iss: JITSI_APP_ID,
      sub: domain,
      room: roomName,
      moderator: isMod,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      nbf: Math.floor(Date.now() / 1000) - 60,   // active 1 min ago
      context: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.profileImage || "",
          moderator: isMod,
          role: role,
        },
        features: {
          recording: isMod,
          livestreaming: false,
          "screen-sharing": true,
        },
      },
    };
    jwt = signJitsiJwt(payload, JITSI_JWT_SECRET);
  }

  return {
    jitsiServer: JITSI_SERVER,
    roomName,
    jwt,
    role,
    user: {
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * Create a secure Jitsi meeting
 */
export async function createJitsiMeeting(
  title?: string
): Promise<JitsiMeeting> {
  const roomName = generateSecureRoomName();
  const fullUrl = `${JITSI_SERVER}/${roomName}`;
  
  return {
    meetingId: roomName,
    joinUrl: fullUrl,
    hostUrl: fullUrl,
    roomName: roomName,
    provider: "jitsi",
  };
}
