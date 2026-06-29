export interface ChatParticipant {
  _id: string;
  name: string;
  profileImage?: string;
  email?: string;
  role?: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  content: string;
  messageType: string;
  createdAt: string | Date;
  isRead: boolean;
  isEdited?: boolean;
  callDuration?: number;
}

export interface ChatConversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  updatedAt: string | Date;
  unreadCount?: number;
}

export interface ChatUser {
  _id: string;
  role: string;
}
