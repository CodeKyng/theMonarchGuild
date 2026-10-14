import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FolderPlus } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { projectStatuses, type ProjectStatus } from "@/components/admin/projects/types";

interface ProjectFormValues {
  title: string;
  description: string;
  owner: string;
  category: string;
  skills: string;
  projectUrl: string;
  status: ProjectStatus;
}

export default function AdminCreateProjectDialog({ onCreated }: { onCreated: () => void }) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    defaultValues: { title: "", description: "", owner: "", category: "", skills: "", projectUrl: "", status: "Planning" },
  });

  const status = useWatch({ control, name: "status" });

  const createProject: SubmitHandler<ProjectFormValues> = async (values) => {
    if (role !== "admin" || !user) {
      setError("root.server", { type: "permission", message: "Only signed-in admins can create projects." });
      return;
    }

    try {
      await addDoc(collection(db, "projects"), {
        title: values.title.trim(),
        description: values.description.trim(),
        owner: values.owner.trim(),
        category: values.category.trim(),
        skills: values.skills.trim(),
        projectUrl: values.projectUrl.trim(),
        status: values.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create guild project:", error);
      setError("root.server", { type: "server", message: "The project could not be saved. Check your permissions and try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) setOpen(nextOpen); }}>
      <DialogTrigger render={<Button type="button" className="gap-2 bg-amber-400 text-black hover:bg-amber-300"><FolderPlus className="size-4" aria-hidden="true" />Add project</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a guild project</DialogTitle>
          <DialogDescription>Share a project members can contribute to, learn from, or showcase.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(createProject)} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-title">Project name <span className="text-primary">*</span></Label>
            <Input id="project-title" placeholder="Guild contributor portal" aria-invalid={Boolean(errors.title)} {...register("title", { required: "Enter a project name.", maxLength: { value: 120, message: "Use 120 characters or fewer." } })} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-owner">Project owner</Label>
            <Input id="project-owner" placeholder="Team or owner name" {...register("owner", { maxLength: 100 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-category">Category</Label>
            <Input id="project-category" placeholder="DeFi, community, tooling…" {...register("category", { maxLength: 80 })} />
          </div>

          <div className="space-y-2">
            <Label>Project status</Label>
            <Select value={status} onValueChange={(value) => setValue("status", (value ?? "Planning") as ProjectStatus, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger aria-label="Project status" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{projectStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-skills">Skills needed</Label>
            <Input id="project-skills" placeholder="Solidity, design, community…" {...register("skills", { maxLength: 300 })} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-url">Project link</Label>
            <Input id="project-url" type="url" placeholder="https://…" aria-invalid={Boolean(errors.projectUrl)} {...register("projectUrl", { validate: (value) => !value || /^https?:\/\//i.test(value.trim()) || "Enter a valid http or https URL." })} />
            {errors.projectUrl && <p className="text-xs text-destructive">{errors.projectUrl.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-description">Project description</Label>
            <Textarea id="project-description" placeholder="What is the project building, and how can guild members get involved?" className="min-h-28 resize-y" {...register("description", { maxLength: { value: 1200, message: "Use 1,200 characters or fewer." } })} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {errors.root?.server && <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors.root.server.message}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-black hover:bg-amber-300">{isSubmitting ? "Saving…" : "Create project"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
