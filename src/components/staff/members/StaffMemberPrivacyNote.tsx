import { LockKeyhole } from "lucide-react";

export default function StaffMemberPrivacyNote() {
  return <aside className="flex gap-3 rounded-2xl border border-border bg-muted/35 p-4 sm:p-5"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">This directory includes only members who opted in to share a professional profile. Private account details such as sign-in email are not shown.</p></aside>;
}
