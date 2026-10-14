import { MessageCircle } from "lucide-react";
import type { MemberConversation } from "@/components/member/messages/types";

function dateLabel(date: Date | null) {
  if (!date) return "";
  const today = new Date();
  return date.toDateString() === today.toDateString() ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date) : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export default function ConversationListItem({ conversation, currentUserId, selected, onSelect }: { conversation: MemberConversation; currentUserId: string; selected: boolean; onSelect: (conversation: MemberConversation) => void }) {
  const otherId = conversation.participants.find((id) => id !== currentUserId) ?? "";
  const name = conversation.participantNames[otherId] || "Guild member";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M";
  return <button type="button" onClick={() => onSelect(conversation)} aria-current={selected ? "true" : undefined} className={`flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors ${selected ? "bg-primary/10" : "hover:bg-muted/70"}`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{name}</span><span className="shrink-0 text-[10px] text-muted-foreground">{dateLabel(conversation.lastMessageAt ?? conversation.updatedAt)}</span></span><span className="mt-1 block truncate text-xs text-muted-foreground">{conversation.lastMessage || <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" />Start the conversation</span>}</span></span></button>;
}
