import {
  BookOpen, CheckCircle2,
} from "lucide-react";

import type { AdminModuleConfig } from "./AdminModulePage";

type ModuleSeed = Omit<AdminModuleConfig, "principles"> & {
  icon: AdminModuleConfig["principles"][number]["icon"];
  principles: [
    { title: string; description: string },
    { title: string; description: string },
  ];
};

const modules: Record<string, ModuleSeed> = {
};

export const adminModuleContent: Record<string, AdminModuleConfig & { icon: ModuleSeed["icon"] }> = Object.fromEntries(
  Object.entries(modules).map(([slug, { principles, ...module }]) => [
    slug,
    {
      ...module,
      principles: principles.map((principle, index) => ({
        ...principle,
        icon: index === 0 ? CheckCircle2 : BookOpen,
      })),
    },
  ]),
);
