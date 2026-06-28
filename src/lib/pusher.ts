import PusherServer from "pusher";
import PusherClient from "pusher-js";

const pusherKey =
  process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || "";
const pusherCluster =
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: pusherKey,
  secret: process.env.PUSHER_SECRET!,
  cluster: pusherCluster,
  useTLS: true,
});

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("Pusher client is only available in the browser");
  }

  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error(
        "Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER. Add them to .env and restart the dev server."
      );
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
  }

  return pusherClientInstance;
}
