import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ArrowUpRight, Eye, LockKeyhole, Trophy, UsersRound } from "lucide-react";
import type { User } from "firebase/auth";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase";

function VisibilityStatus({ visible }: { visible: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        visible
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {visible ? "Visible" : "Private"}
    </span>
  );
}

export default function StaffPrivacySettingsCard({ user }: { user: User }) {
  const [visibility, setVisibility] = useState<{ directory: boolean; leaderboard: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data() ?? {};
        setVisibility({
          directory: data.showInMemberDirectory === true,
          leaderboard: data.showOnLeaderboard === true,
        });
        setError("");
      })
      .catch((loadError) => {
        console.error("Failed to load staff privacy settings:", loadError);
        if (active) setError("Privacy settings could not be loaded. Open your account page to review them.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
          Privacy and discovery
        </CardTitle>
        <p className="text-sm text-muted-foreground">Review what other Guild members can discover.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3" role="status" aria-label="Loading privacy settings">
            <div className="h-14 animate-pulse rounded-xl bg-muted" />
            <div className="h-14 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <UsersRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 text-sm">Member directory profile</span>
              <VisibilityStatus visible={visibility?.directory ?? false} />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
              <Trophy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 text-sm">Leaderboard profile</span>
              <VisibilityStatus visible={visibility?.leaderboard ?? false} />
            </div>
          </>
        )}

        {error && <p role="status" className="text-xs leading-5 text-muted-foreground">{error}</p>}

        <Link
          to="/staff/account"
          className="flex items-center justify-between gap-2 px-1 pt-1 text-sm font-medium text-primary hover:underline"
        >
          <span className="inline-flex items-center gap-2">
            <Eye className="size-4" aria-hidden="true" />
            Review profile visibility
          </span>
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
