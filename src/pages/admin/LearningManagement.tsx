import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";

import LearningDirectory from "@/components/admin/learning-management/LearningDirectory";
import LearningManagementHeader from "@/components/admin/learning-management/LearningManagementHeader";
import LearningOverview from "@/components/admin/learning-management/LearningOverview";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { learningStatuses, type LearningResource, type LearningStatus } from "@/components/admin/learning-management/types";

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

function learningResourceFromDocument(id: string, data: Record<string, unknown>): LearningResource {
  const statusValue = stringValue(data.status);
  return {
    id,
    title: stringValue(data.title) || "Untitled learning resource",
    summary: stringValue(data.summary) || stringValue(data.description),
    instructor: stringValue(data.instructor) || stringValue(data.publisher),
    category: stringValue(data.category) || stringValue(data.topic),
    format: stringValue(data.format) || "Resource",
    level: stringValue(data.level) || "All levels",
    duration: stringValue(data.duration),
    skills: stringValue(data.skills),
    resourceUrl: stringValue(data.resourceUrl) || stringValue(data.url),
    status: learningStatuses.find((item) => item === statusValue) ?? "Draft",
    createdAt: toDate(data.createdAt),
  };
}

function csvValue(value: unknown) {
  const text = String(value instanceof Date ? value.toISOString().slice(0, 10) : value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export default function AdminLearningManagement() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "learningCourses"));
      const rows = snapshot.docs.map((entry) => learningResourceFromDocument(entry.id, entry.data()));
      rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setResources(rows);
    } catch (loadError) {
      console.error("Failed to load learning catalog:", loadError);
      setError("Learning resources could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const categories = useMemo(() => [...new Set(resources.map((resource) => resource.category.trim()).filter(Boolean))].sort(), [resources]);
  const filteredResources = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSearch = !needle || [resource.title, resource.summary, resource.instructor, resource.category, resource.skills]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (status === "all" || resource.status === status) && (category === "all" || resource.category === category);
    });
  }, [category, resources, search, status]);

  async function updateResourceStatus(id: string, nextStatus: LearningStatus) {
    setUpdatingId(id);
    setUpdateErrors((current) => ({ ...current, [id]: "" }));
    try {
      await updateDoc(doc(db, "learningCourses", id), { status: nextStatus, updatedAt: serverTimestamp() });
      setResources((current) => current.map((resource) => resource.id === id ? { ...resource, status: nextStatus } : resource));
    } catch (saveError) {
      console.error("Failed to update learning resource status:", saveError);
      setUpdateErrors((current) => ({ ...current, [id]: "Status could not be updated. Check permissions and try again." }));
    } finally {
      setUpdatingId("");
    }
  }

  function exportCatalog() {
    const columns: (keyof LearningResource)[] = ["title", "category", "format", "level", "duration", "instructor", "skills", "resourceUrl", "status"];
    const csv = [columns.join(","), ...filteredResources.map((resource) => columns.map((column) => csvValue(resource[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "monarch-guild-learning-catalog.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-7">
      <LearningManagementHeader
        loading={loading}
        exportDisabled={!filteredResources.length}
        onRefresh={() => void refresh()}
        onExport={exportCatalog}
        onCreated={() => void refresh()}
      />

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <LearningOverview resources={resources} loading={loading} />
      <LearningDirectory
        resources={filteredResources}
        loading={loading}
        search={search}
        status={status}
        category={category}
        categories={categories}
        updatingId={updatingId}
        updateErrors={updateErrors}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onResourceStatusChange={updateResourceStatus}
      />

      <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">This page manages the learning catalog. Enrollment and learner progress tracking are not connected to the app yet.</p>
    </div>
  );
}
