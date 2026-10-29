import { ArrowLeft, CircleUserRound, LoaderCircle, MessageCircle, Send } from "lucide-react";
import type { DirectMessage, MemberConversation } from "@/components/member/messages/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

function timeLabel(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
    : "";
}

export default function MessageThread({
  conversation,
  messages,
  currentUserId,
  loading,
  sending,
  draft,
  onDraft,
  onSend,
  onBack,
  onOpenParticipant,
}: {
  conversation: MemberConversation | null;
  messages: DirectMessage[];
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
  onOpenParticipant?: (participantId: string, displayName: string) => void;
}) {
  if (!conversation) {
    return (
      <section className="hidden min-h-0 min-w-0 flex-1 flex-col items-center justify-center p-8 text-center md:flex">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="size-6" />
        </span>
        <h2 className="mt-4 font-semibold">Your conversations live here</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          Choose a conversation or start a new one with a member who has opted into the Guild directory.
        </p>
      </section>
    );
  }

  const otherId = conversation.participants.find((id) => id !== currentUserId) ?? "";
  const name = conversation.participantNames[otherId] || "Guild member";

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
          aria-label="Back to inbox"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onOpenParticipant?.(otherId, name)}
          aria-label={`View ${name}'s profile`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <CircleUserRound className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold hover:underline">{name}</h2>
            <p className="text-xs text-muted-foreground">Private Guild conversation</p>
          </div>
        </button>
      </header>

      <ScrollArea orientation="vertical" className="min-h-0 flex-1 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading messages…
            </div>
          ) : messages.length ? (
            messages.map((message) => {
              const own = message.senderId === currentUserId;
              return (
                <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
                      own
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        own ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {timeLabel(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid flex-1 place-items-center py-16 text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <MessageCircle className="size-5" />
                </span>
                <p className="mt-3 text-sm font-medium">Say hello to {name}</p>
                <p className="mt-1 text-xs text-muted-foreground">This is the start of your conversation.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="shrink-0 border-t border-border bg-background p-3 sm:p-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={`Message ${name}…`}
            aria-label="Write a message"
            maxLength={2000}
            rows={2}
            className="max-h-36 min-h-11 resize-y"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            aria-label="Send message"
            disabled={sending || !draft.trim()}
          >
            {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="mx-auto mt-1 max-w-3xl text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for a new line · {draft.length}/2000
        </p>
      </form>
    </section>
  );
}
