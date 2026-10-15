import { Settings2 } from "lucide-react";

export default function StaffSettingsHeader() {
  return (
    <header className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 via-card to-card p-5 sm:p-7">
      <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        <Settings2 className="size-4" aria-hidden="true" />
        The Monarch Guild · Staff workspace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        Manage your account, sign-in security, and how your staff workspace looks.
      </p>
    </header>
  );
}
