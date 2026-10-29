import { useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { LoaderCircle, Send } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { notifyAllMembers } from "@/lib/notifications";
import { announcementCategories, announcementStatuses, type AnnouncementCategory, type AnnouncementStatus, type GuildAnnouncement } from "./types";

function localDateTime(date: Date | null) {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AnnouncementComposerDialog({
  open,
  announcement,
  onClose,
  onSaved,
}: {
  open: boolean;
  announcement: GuildAnnouncement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [category, setCategory] = useState<AnnouncementCategory>(announcement?.category ?? "Guild update");
  const [status, setStatus] = useState<AnnouncementStatus>(announcement?.status ?? "Draft");
  const [publishAt, setPublishAt] = useState(localDateTime(announcement?.publishAt ?? null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!user) {
      setError("Sign in again to save an announcement.");
      return;
    }
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) {
      setError("Add a title and announcement text before saving.");
      return;
    }
    const scheduledDate: Date | null = publishAt ? new Date(publishAt) : null;
    if (
      status === "Scheduled" &&
      (!scheduledDate || Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now())
    ) {
      setError("Choose a future date and time for a scheduled announcement.");
      return;
    }
    const publishDate =
      status === "Published"
        ? announcement?.status === "Published"
          ? announcement.publishAt
          : new Date()
        : status === "Scheduled"
          ? scheduledDate
          : null;
    setSaving(true);
    setError("");
    try {
      const announcementData = {
        title: cleanTitle,
        body: cleanBody,
        category,
        status,
        publishAt: publishDate,
        updatedAt: serverTimestamp(),
      };
      const wasPublished = announcement?.status === "Published";
      if (announcement) {
        await updateDoc(doc(db, "announcements", announcement.id), announcementData);
      } else {
        await addDoc(collection(db, "announcements"), {
          ...announcementData,
          createdBy: user.uid,
          createdByName: user.displayName?.trim() || user.email?.split("@")[0] || "Guild staff",
          createdAt: serverTimestamp(),
        });
      }
      if (status === "Published" && !wasPublished) {
        try {
          await notifyAllMembers(db, {
            type: "announcement",
            title: cleanTitle,
            body: cleanBody.length > 160 ? `${cleanBody.slice(0, 157)}…` : cleanBody,
            href: "/member/community",
            actorName: user.displayName || user.email || "Guild staff",
            sourceId: announcement?.id ?? "",
          });
        } catch (notifyErr) {
          console.error("Failed to notify members of announcement:", notifyErr);
        }
      }
      onSaved();
      onClose();
    } catch (saveError) {
      console.error("Failed to save announcement:", saveError);
      setError(
        "The announcement could not be saved. Check your connection and staff permissions, then try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit announcement" : "Create announcement"}</DialogTitle>
          <DialogDescription>
            Write a clear update for the guild. Publish when ready or keep it as a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What should members know?"
              maxLength={160}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-body">Message</Label>
            <Textarea
              id="announcement-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share the details members need to know…"
              rows={7}
              maxLength={4000}
              className="resize-y"
              disabled={saving}
            />
            <p className="text-right text-xs text-muted-foreground">{body.length}/4,000</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-category">Topic</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (value) setCategory(value as AnnouncementCategory);
                }}
                disabled={saving}
              >
                <SelectTrigger id="announcement-category" className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {announcementCategories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as AnnouncementStatus);
                }}
                disabled={saving}
              >
                <SelectTrigger id="announcement-status" className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {announcementStatuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {status === "Scheduled" && (
            <div className="space-y-2">
              <Label htmlFor="announcement-publish-date">Publish date and time</Label>
              <Input
                id="announcement-publish-date"
                type="datetime-local"
                value={publishAt}
                onChange={(event) => setPublishAt(event.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Scheduled announcements are saved for the selected time. Automatic publishing requires a
                server-side scheduler.
              </p>
            </div>
          )}
          {status === "Published" && (
            <p className="rounded-xl bg-emerald-500/5 px-3 py-2 text-xs leading-5 text-muted-foreground">
              This announcement will be marked as published immediately and members will be notified.
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void save()} disabled={saving || !user}>
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {saving ? "Saving…" : announcement ? "Save changes" : "Save announcement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
