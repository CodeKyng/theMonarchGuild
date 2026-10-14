import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { BookPlus } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { learningFormats, learningLevels, learningStatuses, type LearningStatus } from "@/components/admin/learning-management/types";

interface LearningFormValues {
  title: string;
  summary: string;
  instructor: string;
  category: string;
  format: string;
  level: string;
  duration: string;
  skills: string;
  resourceUrl: string;
  status: LearningStatus;
}

export default function AdminCreateLearningResourceDialog({ onCreated }: { onCreated: () => void }) {
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
  } = useForm<LearningFormValues>({
    defaultValues: { title: "", summary: "", instructor: "", category: "", format: "Course", level: "Beginner", duration: "", skills: "", resourceUrl: "", status: "Draft" },
  });
  const format = useWatch({ control, name: "format" });
  const level = useWatch({ control, name: "level" });
  const status = useWatch({ control, name: "status" });

  const createResource: SubmitHandler<LearningFormValues> = async (values) => {
    if (role !== "admin" || !user) {
      setError("root.server", { type: "permission", message: "Only signed-in admins can add learning resources." });
      return;
    }
    try {
      await addDoc(collection(db, "learningCourses"), {
        title: values.title.trim(),
        summary: values.summary.trim(),
        instructor: values.instructor.trim(),
        category: values.category.trim(),
        format: values.format,
        level: values.level,
        duration: values.duration.trim(),
        skills: values.skills.trim(),
        resourceUrl: values.resourceUrl.trim(),
        status: values.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create learning resource:", error);
      setError("root.server", { type: "server", message: "The resource could not be saved. Check your permissions and try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) setOpen(nextOpen); }}>
      <DialogTrigger render={<Button type="button" className="gap-2 bg-amber-400 text-black hover:bg-amber-300"><BookPlus className="size-4" aria-hidden="true" />Add resource</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a learning resource</DialogTitle>
          <DialogDescription>Build a practical catalog that helps guild members grow Web3 skills.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(createResource)} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="learning-title">Title <span className="text-primary">*</span></Label>
            <Input id="learning-title" placeholder="Smart contract security foundations" aria-invalid={Boolean(errors.title)} {...register("title", { required: "Enter a resource title.", maxLength: { value: 140, message: "Use 140 characters or fewer." } })} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-category">Topic</Label>
            <Input id="learning-category" placeholder="Smart contracts, DeFi…" {...register("category", { maxLength: 80 })} />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value) => setValue("format", value ?? "Course", { shouldDirty: true })}>
              <SelectTrigger className="w-full" aria-label="Learning format"><SelectValue /></SelectTrigger>
              <SelectContent>{learningFormats.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Experience level</Label>
            <Select value={level} onValueChange={(value) => setValue("level", value ?? "Beginner", { shouldDirty: true })}>
              <SelectTrigger className="w-full" aria-label="Experience level"><SelectValue /></SelectTrigger>
              <SelectContent>{learningLevels.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="learning-duration">Estimated time</Label>
            <Input id="learning-duration" placeholder="e.g. 4 weeks, 90 minutes" {...register("duration", { maxLength: 80 })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-instructor">Instructor or publisher</Label>
            <Input id="learning-instructor" placeholder="Name or organization" {...register("instructor", { maxLength: 120 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="learning-skills">Skills covered</Label>
            <Input id="learning-skills" placeholder="Solidity, auditing, testing…" {...register("skills", { maxLength: 400 })} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="learning-url">Resource link</Label>
            <Input id="learning-url" type="url" placeholder="https://…" aria-invalid={Boolean(errors.resourceUrl)} {...register("resourceUrl", { validate: (value) => !value || /^https?:\/\//i.test(value.trim()) || "Enter a valid http or https URL." })} />
            {errors.resourceUrl && <p className="text-xs text-destructive">{errors.resourceUrl.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="learning-summary">Summary</Label>
            <Textarea id="learning-summary" placeholder="What will members learn, and how can they put it into practice?" className="min-h-28 resize-y" {...register("summary", { maxLength: { value: 1200, message: "Use 1,200 characters or fewer." } })} />
            {errors.summary && <p className="text-xs text-destructive">{errors.summary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Publication status</Label>
            <Select value={status} onValueChange={(value) => setValue("status", (value ?? "Draft") as LearningStatus, { shouldDirty: true })}>
              <SelectTrigger className="w-full" aria-label="Publication status"><SelectValue /></SelectTrigger>
              <SelectContent>{learningStatuses.filter((item) => item !== "Archived").map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {errors.root?.server && <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors.root.server.message}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-black hover:bg-amber-300">{isSubmitting ? "Saving…" : "Save resource"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
