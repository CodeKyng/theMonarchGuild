export interface MemberContact {
  id: string;
  displayName: string;
  professionalTitle: string;
}

export interface MemberConversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Date | null;
  lastMessageId: string;
  /** uid of who sent the last message */
  lastMessageSenderId: string;
  updatedAt: Date | null;
  /** per-participant last time they opened the thread */
  participantLastRead: Record<string, Date | null>;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date | null;
}

/** True when the other person sent the latest message and you have not opened it since. */
export function isConversationUnread(
  conversation: MemberConversation,
  currentUserId: string,
): boolean {
  if (!currentUserId || !conversation.lastMessage) return false;
  if (conversation.lastMessageSenderId === currentUserId) return false;
  const lastAt = conversation.lastMessageAt?.getTime() ?? 0;
  if (!lastAt) return false;
  const readAt = conversation.participantLastRead[currentUserId]?.getTime() ?? 0;
  return lastAt > readAt;
}
