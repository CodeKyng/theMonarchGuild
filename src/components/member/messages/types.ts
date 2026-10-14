export interface MemberContact { id: string; displayName: string; professionalTitle: string; }
export interface MemberConversation { id: string; participants: string[]; participantNames: Record<string, string>; lastMessage: string; lastMessageAt: Date | null; lastMessageId: string; updatedAt: Date | null; }
export interface DirectMessage { id: string; senderId: string; body: string; createdAt: Date | null; }
