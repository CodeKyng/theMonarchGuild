import { Settings2 } from "lucide-react";
import AdminSettingsLinks from "@/components/admin/platform-settings/AdminSettingsLinks";
import AppearanceSettings from "@/components/admin/platform-settings/AppearanceSettings";
import FirebaseEnvironmentSettings from "@/components/admin/platform-settings/FirebaseEnvironmentSettings";

export default function AdminPlatformSettings() {
  return <div className="space-y-7">
    <header><p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Settings2 className="size-4" aria-hidden="true" />Guild administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Platform Settings</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Manage the admin workspace experience and review the configuration the app uses to connect to its platform services.</p></header>
    <AppearanceSettings />
    <FirebaseEnvironmentSettings />
    <AdminSettingsLinks />
    <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">Theme changes are saved to this browser. Firebase credentials, enabled sign-in providers, and deployed security rules are managed in Firebase Console; this workspace does not edit those project-wide settings.</p>
  </div>;
}
