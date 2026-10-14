import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
export default function MemberDirectoryPrivacyNote() {
  return <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">Only members who opt in appear here. Sign-in email and account settings stay private; shared professional profile details can be seen by signed-in guild members.</p></div><Link to="/member/profile" className="shrink-0 text-sm font-medium text-primary hover:underline">Manage my visibility</Link></div>;
}
