import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { CalendarDays, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import AdminEventsPanel, { type AdminEventRow } from "@/components/admin/AdminEventsPanel";
import { db } from "@/firebase";

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const rows = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          title: typeof data.title === "string" && data.title.trim() ? data.title : "Guild event",
          date: toDate(data.date),
          time: typeof data.time === "string" ? data.time : "",
          location: typeof data.venue === "string" ? data.venue : typeof data.location === "string" ? data.location : "",
          status: typeof data.status === "string" ? data.status : "",
        } satisfies AdminEventRow;
      }).sort((a, b) => (a.date?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.date?.getTime() ?? Number.MAX_SAFE_INTEGER));
      setEvents(rows);
    } catch (loadError) {
      console.error("Failed to load admin events:", loadError);
      setError("Events could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Guild administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl"><CalendarDays className="size-7 text-primary" />Events</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Create and review events that bring Web3 builders and enthusiasts together.</p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh events
        </Button>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <AdminEventsPanel events={events} loading={loading} onEventAdded={() => void refresh()} />
    </div>
  );
}
