import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { authorizePusherChannel } from "@/lib/chat-permissions";
import { captureException } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const authorized = await authorizePusherChannel(user, channelName);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "pusher/auth" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
