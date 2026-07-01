import { pusherServer } from "@/lib/pusher";

export function getUserChannelName(userId: string) {
  return `private-user-${userId}`;
}

export async function triggerUserUpdate(userId: string, updateType: string, data?: any) {
  try {
    await pusherServer.trigger(
      getUserChannelName(userId), 'user-update', {
      type: updateType,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to trigger user update:", error);
  }
}

export async function triggerDashboardUpdate(userId: string) {
  await triggerUserUpdate(userId, 'dashboard-refresh');
}

export async function triggerSessionUpdate(sessionId: string, updateType: string, data?: any) {
  try {
    await pusherServer.trigger(
      'public-sessions',
      'session-update',
      {
        sessionId,
        type: updateType,
        data,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Failed to trigger session update:", error);
  }
}

export async function triggerPaymentUpdate(paymentId: string, updateType: string, data?: any) {
  try {
    await pusherServer.trigger(
      'public-payments',
      'payment-update',
      {
        paymentId,
        type: updateType,
        data,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Failed to trigger payment update:", error);
  }
};

