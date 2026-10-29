import { useEffect, useState } from "react";
import { ExternalLink, Globe, LoaderCircle, MapPin, Sparkles, UserPlus, UserMinus, Users } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/firebase";
import {
  getFollowingList,
  getFollowerCount,
  getFollowingCount,
  isFollowing,
  toggleFollow,
} from "@/lib/follow";

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export default function MemberProfileDialog({
  member,
  onClose,
}: {
  member: PublicMemberProfile | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followingList, setFollowingList] = useState<{ id: string; displayName: string }[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!member) return;
    let active = true;
    setLoadingMeta(true);
    setError("");
    (async () => {
      try {
        const [followers, followingN, list, amFollowing] = await Promise.all([
          getFollowerCount(db, member.id),
          getFollowingCount(db, member.id),
          getFollowingList(db, member.id),
          user ? isFollowing(db, user.uid, member.id) : Promise.resolve(false),
        ]);
        if (!active) return;
        setFollowerCount(followers);
        setFollowingCount(followingN);
        setFollowingList(list);
        setFollowing(amFollowing);
      } catch (err) {
        console.error("Failed to load follow meta:", err);
        if (active) setError("Could not load follow details.");
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [member, user]);

  async function handleFollowToggle() {
    if (!user || !member || toggling) return;
    setToggling(true);
    setError("");
    try {
      const result = await toggleFollow(
        db,
        user.uid,
        member.id,
        user.displayName || user.email || "A guild member",
      );
      setFollowing(result === "followed");
      const [followers, followingN, list] = await Promise.all([
        getFollowerCount(db, member.id),
        getFollowingCount(db, member.id),
        getFollowingList(db, member.id),
      ]);
      setFollowerCount(followers);
      setFollowingCount(followingN);
      setFollowingList(list);
    } catch (err) {
      console.error("Follow toggle failed:", err);
      setError("Could not update follow. Try again.");
    } finally {
      setToggling(false);
    }
  }

  const initials =
    member?.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "M";

  const links = member
    ? (
        [
          ["Portfolio", member.websiteUrl],
          ["LinkedIn", member.linkedinUrl],
          ["GitHub", member.githubUrl],
          ["X / Twitter", member.twitterUrl],
        ] as const
      )
        .filter(([, href]) => Boolean(href))
        .map(([label, href]) => ({ label, href: safeUrl(href) }))
        .filter((item) => item.href)
    : [];

  return (
    <Dialog
      open={Boolean(member)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Member profile</DialogTitle>
          <DialogDescription>Professional details shared by this guild member.</DialogDescription>
        </DialogHeader>
        {member && (
          <ScrollArea orientation="vertical" className="max-h-[90dvh] w-full">
            <div className="space-y-5 p-4 pb-6 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                  <Avatar className="size-14 shrink-0 sm:size-16">
                    <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-semibold sm:text-2xl">{member.displayName}</h2>
                    <p className="mt-0.5 break-words text-sm text-muted-foreground">
                      {member.professionalTitle || "Web3 community member"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {member.workType && <span>{member.workType}</span>}
                      {member.experienceYears && <span>{member.experienceYears} years’ experience</span>}
                      {member.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                          {member.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user && (
                  <Button
                    type="button"
                    size="sm"
                    variant={following ? "outline" : "default"}
                    className="w-full shrink-0 sm:w-auto"
                    disabled={toggling || loadingMeta}
                    onClick={() => void handleFollowToggle()}
                  >
                    {toggling ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : following ? (
                      <UserMinus className="size-4" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    {following ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Followers</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {loadingMeta ? "…" : followerCount}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Following</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {loadingMeta ? "…" : followingCount}
                  </p>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              {member.bio && (
                <section>
                  <h3 className="text-sm font-semibold">About</h3>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                    {member.bio}
                  </p>
                </section>
              )}

              {member.skills.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold">Skills</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary sm:text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {member.interests && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-primary" aria-hidden="true" />
                    Web3 interests
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{member.interests}</p>
                </section>
              )}

              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="size-4 text-primary" aria-hidden="true" />
                  Social & portfolio
                </h3>
                {links.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {links.map(({ label, href }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                      >
                        {label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">No social links shared yet.</p>
                )}
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  Following ({loadingMeta ? "…" : followingList.length})
                </h3>
                {loadingMeta ? (
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Loading…
                  </p>
                ) : followingList.length > 0 ? (
                  <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border/70 p-2">
                    {followingList.map((person) => (
                      <li
                        key={person.id}
                        className="truncate rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                      >
                        {person.displayName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">Not following anyone yet.</p>
                )}
              </section>

              <p className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                This member chose to share these professional details with signed-in guild members.
              </p>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
