import { Archive, BookOpenCheck, FilePenLine, LibraryBig } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import type { LearningResource } from "@/components/admin/learning-management/types";

export default function LearningOverview({ resources, loading }: { resources: LearningResource[]; loading: boolean }) {
  const published = resources.filter((resource) => resource.status === "Published").length;
  const drafts = resources.filter((resource) => resource.status === "Draft").length;
  const archived = resources.filter((resource) => resource.status === "Archived").length;

  return (
    <section aria-label="Learning catalog summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Total resources" value={resources.length} detail="Learning items in the catalog" icon={LibraryBig} loading={loading && resources.length === 0} />
      <AdminStatCard label="Published" value={published} detail="Visible in the learning catalog" icon={BookOpenCheck} loading={loading && resources.length === 0} />
      <AdminStatCard label="Drafts" value={drafts} detail="In preparation for members" icon={FilePenLine} loading={loading && resources.length === 0} />
      <AdminStatCard label="Archived" value={archived} detail="Retained for reference" icon={Archive} loading={loading && resources.length === 0} />
    </section>
  );
}
