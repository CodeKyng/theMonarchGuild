import { MessageCircle } from "lucide-react";
import type { MemberConversation } from "@/components/member/messages/types";
import { isConversationUnread } from "@/components/member/messages/types";

function dateLabel(date: Date | null) {
  if (!date) return "";
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export default function ConversationListItem({
  conversation,
  currentUserId,
  selected,
  onSelect,
}: {
  conversation: MemberConversation;
  currentUserId: string;
  selected: boolean;
  onSelect: (conversation: MemberConversation) => void;
}) {
  const otherId = conversation.participants.find((id) => id !== currentUserId) ?? "";
  const name = conversation.participantNames[otherId] || "Guild member";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "M";
  const unread = isConversationUnread(conversation, currentUserId);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      aria-current={selected ? "true" : undefined}
      aria-label={unread ? `${name}, unread message` : name}
      className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
        selected
          ? "border-primary/30 bg-primary/10"
          : unread
            ? "border-primary/25 bg-primary/[0.06] hover:bg-primary/10"
            : "border-transparent hover:bg-muted/70"
      }`}
    >
      <span
        className={`relative grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
          unread ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {initials}
        {unread && (
          <span
            className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-primary"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${unread ? "font-semibold text-foreground" : "font-medium"}`}>
            {name}
          </span>
          <span
            className={`shrink-0 text-[10px] tabular-nums ${
              unread ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
          >
            {dateLabel(conversation.lastMessageAt ?? conversation.updatedAt)}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span
            className={`block min-w-0 flex-1 truncate text-xs ${
              unread ? "font-medium text-foreground/90" : "text-muted-foreground"
            }`}
          >
            {conversation.lastMessage || (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="size-3" />
                Start the conversation
              </span>
            )}
          </span>
          {unread && (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              New
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
