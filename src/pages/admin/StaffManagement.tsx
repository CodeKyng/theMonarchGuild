import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where, type DocumentData, type QuerySnapshot } from "firebase/firestore";

import { useAuth } from "@/auth/AuthContext";
import AdminUserDetails, { type AdminUser } from "@/components/admin/AdminUserDetails";
import StaffDirectory from "@/components/admin/staff-management/StaffDirectory";
import StaffManagementHeader from "@/components/admin/staff-management/StaffManagementHeader";
import StaffOverviewCards from "@/components/admin/staff-management/StaffOverviewCards";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function readStaff(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      displayName: stringValue(data.displayName),
      email: stringValue(data.email),
      role: stringValue(data.role),
      createdAt: toDate(data.createdAt),
      professionalTitle: stringValue(data.professionalTitle),
      workType: stringValue(data.workType),
      experienceYears: stringValue(data.experienceYears),
      skills: stringValue(data.skills),
      location: stringValue(data.location),
      bio: stringValue(data.bio),
      interests: stringValue(data.interests),
      websiteUrl: stringValue(data.websiteUrl),
      linkedinUrl: stringValue(data.linkedinUrl),
      githubUrl: stringValue(data.githubUrl),
      twitterUrl: stringValue(data.twitterUrl),
      discordHandle: stringValue(data.discordHandle),
    } satisfies AdminUser;
  }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

function escapeCsv(value: unknown) {
  const text = String(value instanceof Date ? value.toISOString().slice(0, 10) : value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export default function AdminStaffManagement() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDocs(query(collection(db, "users"), where("role", "==", "staff")));
      const rows = readStaff(result);
      setStaff(rows);
      setSelectedStaff((selected) => selected ? rows.find((person) => person.id === selected.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load guild staff:", loadError);
      setError("Staff accounts could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const visibleStaff = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return staff.filter((person) => {
      const matchesSearch = !needle || [person.displayName, person.email, person.professionalTitle, person.skills, person.location]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (workType === "all" || person.workType === workType);
    });
  }, [search, staff, workType]);

  function exportTeam() {
    const columns: (keyof AdminUser)[] = ["displayName", "email", "professionalTitle", "workType", "experienceYears", "skills", "location", "createdAt"];
    const csv = [columns.join(","), ...visibleStaff.map((person) => columns.map((column) => escapeCsv(person[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "monarch-guild-staff.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleRoleChanged(id: string, role: string) {
    if (role !== "staff") {
      setStaff((current) => current.filter((person) => person.id !== id));
      setSelectedStaff(null);
      return;
    }
    setStaff((current) => current.map((person) => person.id === id ? { ...person, role } : person));
    setSelectedStaff((current) => current?.id === id ? { ...current, role } : current);
  }

  return (
    <div className="space-y-7">
      <StaffManagementHeader loading={loading} exportDisabled={!visibleStaff.length} onRefresh={() => void refresh()} onExport={exportTeam} />

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button>
        </div>
      )}

      <StaffOverviewCards staff={staff} loading={loading} />
      <StaffDirectory
        staff={visibleStaff}
        loading={loading}
        search={search}
        workType={workType}
        onSearchChange={setSearch}
        onWorkTypeChange={setWorkType}
        onViewProfile={setSelectedStaff}
      />

      <AdminUserDetails
        user={selectedStaff}
        currentUserId={currentUser?.uid ?? ""}
        onClose={() => setSelectedStaff(null)}
        onRoleChanged={handleRoleChanged}
      />
    </div>
  );
}
