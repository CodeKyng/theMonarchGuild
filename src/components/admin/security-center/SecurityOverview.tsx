import { KeyRound, ShieldAlert, ShieldCheck, UsersRound } from "lucide-react";
import type { SecurityAccount } from "@/components/admin/security-center/types";

export default function SecurityOverview({ accounts, eventCount, flaggedCount, loading }: { accounts: SecurityAccount[]; eventCount: number; flaggedCount: number; loading: boolean }) {
  const admins = accounts.filter((account) => account.role === "admin").length;
  const staff = accounts.filter((account) => account.role === "staff").length;
  const cards = [
    { label: "Total accounts", value: accounts.length, detail: "Accounts in the guild directory", icon: UsersRound, tone: "text-sky-700 bg-sky-500/10" },
    { label: "Privileged access", value: admins + staff, detail: `${admins} admins · ${staff} staff`, icon: KeyRound, tone: "text-violet-700 bg-violet-500/10" },
    { label: "Security events", value: eventCount, detail: "Events available from audit logs", icon: ShieldCheck, tone: "text-emerald-700 bg-emerald-500/10" },
    { label: "Flagged accounts", value: flaggedCount, detail: "Profiles with a security review flag", icon: ShieldAlert, tone: flaggedCount ? "text-red-700 bg-red-500/10" : "text-muted-foreground bg-muted" },
  ];
  return <section aria-label="Security overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" /> : value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></article>)}</section>;
}
