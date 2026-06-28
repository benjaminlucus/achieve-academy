export function getChatChannelName(conversationId: string): string {
  return `private-chat-${conversationId}`;
}

export function getUserChannelName(userId: string): string {
  return `private-user-${userId}`;
}
