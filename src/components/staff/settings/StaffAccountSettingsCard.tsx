import { ArrowUpRight, AtSign, BadgeCheck, CircleUserRound, ShieldCheck } from "lucide-react";
import type { User } from "firebase/auth";
import type { UserRole } from "@/auth/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Guild staff",
  member: "Guild member",
};

export default function StaffAccountSettingsCard({
  user,
  role,
}: {
  user: User;
  role: UserRole;
}) {
  const name = user.displayName?.trim() || "Guild staff member";
  const initials = (user.displayName || user.email || "S")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleUserRound className="size-4 text-primary" aria-hidden="true" />
          Account
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your Guild sign-in identity and staff profile.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/40 p-3">
          <Avatar className="size-12">
            <AvatarImage src={user.photoURL ?? undefined} alt={name} />
            <AvatarFallback>{initials || <CircleUserRound className="size-5" />}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{roleLabels[role]}</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <AtSign className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Sign-in email</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">{user.email || "No email available"}</p>
          </div>
          {user.emailVerified && (
            <BadgeCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-label="Email verified" />
          )}
        </div>

        <Link
          to="/staff/account"
          className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CircleUserRound className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Manage profile</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Update your profile details and directory visibility.
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
