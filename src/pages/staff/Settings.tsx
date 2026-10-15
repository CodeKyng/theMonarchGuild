import { useAuth } from "@/auth/AuthContext";
import AppearanceSettings from "@/components/admin/platform-settings/AppearanceSettings";
import SignInSecurityCard from "@/components/member/settings/SignInSecurityCard";
import StaffAccountSettingsCard from "@/components/staff/settings/StaffAccountSettingsCard";
import StaffPrivacySettingsCard from "@/components/staff/settings/StaffPrivacySettingsCard";
import StaffSettingsHeader from "@/components/staff/settings/StaffSettingsHeader";

export default function StaffSettings() {
  const { user, role } = useAuth();

  if (!user || !role) return null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
      <StaffSettingsHeader />
      <section className="grid gap-4 lg:grid-cols-2" aria-label="Staff account settings">
        <StaffAccountSettingsCard user={user} role={role} />
        <SignInSecurityCard user={user} />
      </section>
      <AppearanceSettings />
      <StaffPrivacySettingsCard user={user} />
    </div>
  );
}
