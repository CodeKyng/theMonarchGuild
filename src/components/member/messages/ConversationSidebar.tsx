import { useMemo, useState } from "react";
import { MessageSquarePlus, Search, UsersRound } from "lucide-react";
import type { MemberContact, MemberConversation } from "@/components/member/messages/types";
import ConversationListItem from "@/components/member/messages/ConversationListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ConversationSidebar({
  conversations,
  contacts,
  currentUserId,
  selectedId,
  onSelectConversation,
  onStartConversation,
}: {
  conversations: MemberConversation[];
  contacts: MemberContact[];
  currentUserId: string;
  selectedId: string;
  onSelectConversation: (conversation: MemberConversation) => void;
  onStartConversation: (contact: MemberContact) => void;
}) {
  const [view, setView] = useState<"inbox" | "members">("inbox");
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(
    () =>
      conversations.filter((item) => {
        const otherId = item.participants.find((id) => id !== currentUserId) ?? "";
        return `${item.participantNames[otherId] ?? ""} ${item.lastMessage}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase());
      }),
    [conversations, currentUserId, search],
  );

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        `${contact.displayName} ${contact.professionalTitle}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
      ),
    [contacts, search],
  );

  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border md:border-b-0 md:border-r">
      <div className="shrink-0 space-y-4 border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">{view === "inbox" ? "Your inbox" : "Find members"}</h2>
            <p className="text-xs text-muted-foreground">
              {view === "inbox"
                ? `${conversations.length} conversations`
                : `${contacts.length} discoverable members`}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant={view === "members" ? "default" : "outline"}
            onClick={() => {
              setView(view === "inbox" ? "members" : "inbox");
              setSearch("");
            }}
          >
            <MessageSquarePlus className="size-4" />
            {view === "inbox" ? "New message" : "Inbox"}
          </Button>
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={view === "inbox" ? "Search conversations…" : "Search members…"}
            aria-label={view === "inbox" ? "Search conversations" : "Search discoverable members"}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea orientation="vertical" className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {view === "inbox" ? (
            filteredConversations.length ? (
              filteredConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  selected={conversation.id === selectedId}
                  onSelect={onSelectConversation}
                />
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <MessageSquarePlus className="mx-auto size-7 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium">No conversations yet</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Start a private conversation with a discoverable Guild member.
                </p>
                <Button type="button" variant="link" size="sm" onClick={() => setView("members")}>
                  Find members
                </Button>
              </div>
            )
          ) : filteredContacts.length ? (
            filteredContacts.map((contact) => (
              <button
                type="button"
                key={contact.id}
                onClick={() => onStartConversation(contact)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-muted/70"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">
                  {contact.displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase() || <UsersRound className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{contact.displayName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {contact.professionalTitle || "Guild member"}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No discoverable members match this search.
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
