import { UsersRound } from "lucide-react";

export default function StaffDashboard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">The Monarch Guild</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Staff overview</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Welcome to your staff workspace. Use this space to stay connected with the guild team.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600">
          <UsersRound className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Your workspace is ready</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
          Guild tools and updates will appear here as they become available.
        </p>
      </div>
    </section>
  );
}
