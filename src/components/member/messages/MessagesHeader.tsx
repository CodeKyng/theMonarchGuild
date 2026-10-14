import { LockKeyhole, MessageCircle } from "lucide-react";

export default function MessagesHeader() {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-primary"><MessageCircle className="size-4" aria-hidden="true" />Guild inbox</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Messages</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Connect one-to-one with members who have chosen to be discoverable in the Guild.</p></div><div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:self-auto"><LockKeyhole className="size-3.5 text-primary" aria-hidden="true" />Private member conversations</div></header>;
}
