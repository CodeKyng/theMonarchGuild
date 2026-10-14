import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";

import OpportunityManagementHeader from "@/components/admin/opportunities/OpportunityManagementHeader";
import OpportunitySummary from "@/components/admin/opportunities/OpportunitySummary";
import OpportunitiesDirectory from "@/components/admin/opportunities/OpportunitiesDirectory";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { opportunityStatuses, type AdminOpportunity, type OpportunityStatus } from "@/components/admin/opportunities/types";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

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

function opportunityFromDocument(id: string, data: Record<string, unknown>): AdminOpportunity {
  const statusValue = stringValue(data.status);
  const status = opportunityStatuses.find((item) => item === statusValue) ?? "Open";
  return {
    id,
    title: stringValue(data.title) || "Untitled opportunity",
    organization: stringValue(data.organization) || stringValue(data.company),
    type: stringValue(data.type),
    location: stringValue(data.location),
    arrangement: stringValue(data.arrangement),
    compensation: stringValue(data.compensation),
    description: stringValue(data.description) || stringValue(data.summary),
    skills: stringValue(data.skills),
    applicationUrl: stringValue(data.applicationUrl) || stringValue(data.url),
    deadline: toDate(data.deadline),
    status,
    createdAt: toDate(data.createdAt),
  };
}

function csvValue(value: unknown) {
  const text = String(value instanceof Date ? value.toISOString().slice(0, 10) : value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "opportunities"));
      const rows = snapshot.docs.map((entry) => opportunityFromDocument(entry.id, entry.data()));
      rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setOpportunities(rows);
    } catch (loadError) {
      console.error("Failed to load guild opportunities:", loadError);
      setError("Opportunities could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const filteredOpportunities = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return opportunities.filter((item) => {
      const matchesSearch = !needle || [item.title, item.organization, item.description, item.skills, item.location]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (status === "all" || item.status === status) && (type === "all" || item.type === type);
    });
  }, [opportunities, search, status, type]);

  async function updateOpportunityStatus(id: string, nextStatus: OpportunityStatus) {
    setUpdatingId(id);
    setUpdateErrors((current) => ({ ...current, [id]: "" }));
    try {
      await updateDoc(doc(db, "opportunities", id), { status: nextStatus, updatedAt: serverTimestamp() });
      setOpportunities((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
    } catch (saveError) {
      console.error("Failed to update opportunity status:", saveError);
      setUpdateErrors((current) => ({ ...current, [id]: "Status could not be updated. Check permissions and try again." }));
    } finally {
      setUpdatingId("");
    }
  }

  function exportCsv() {
    const columns: (keyof AdminOpportunity)[] = ["title", "organization", "type", "location", "arrangement", "compensation", "deadline", "applicationUrl", "skills", "status"];
    const csv = [columns.join(","), ...filteredOpportunities.map((item) => columns.map((column) => csvValue(item[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "monarch-guild-opportunities.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-7">
      <OpportunityManagementHeader
        loading={loading}
        exportDisabled={!filteredOpportunities.length}
        onRefresh={() => void refresh()}
        onExport={exportCsv}
        onCreated={() => void refresh()}
      />

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <OpportunitySummary opportunities={opportunities} loading={loading} />
      <OpportunitiesDirectory
        opportunities={filteredOpportunities}
        loading={loading}
        search={search}
        status={status}
        type={type}
        updatingId={updatingId}
        updateErrors={updateErrors}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onOpportunityStatusChange={updateOpportunityStatus}
      />
    </div>
  );
}
