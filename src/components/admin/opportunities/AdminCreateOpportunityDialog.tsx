import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { BriefcaseBusiness } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { opportunityTypes } from "@/components/admin/opportunities/types";

interface OpportunityFormValues {
  title: string;
  organization: string;
  type: string;
  location: string;
  arrangement: string;
  compensation: string;
  deadline: string;
  applicationUrl: string;
  skills: string;
  description: string;
}

const arrangements = ["Remote", "Hybrid", "On-site"];

export default function AdminCreateOpportunityDialog({ onCreated }: { onCreated: () => void }) {
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
  } = useForm<OpportunityFormValues>({
    defaultValues: { title: "", organization: "", type: "Full-time", location: "", arrangement: "Remote", compensation: "", deadline: "", applicationUrl: "", skills: "", description: "" },
  });
  const type = useWatch({ control, name: "type" });
  const arrangement = useWatch({ control, name: "arrangement" });

  const createOpportunity: SubmitHandler<OpportunityFormValues> = async (values) => {
    if (role !== "admin" || !user) {
      setError("root.server", { type: "permission", message: "Only signed-in admins can add opportunities." });
      return;
    }
    try {
      await addDoc(collection(db, "opportunities"), {
        title: values.title.trim(),
        organization: values.organization.trim(),
        type: values.type,
        location: values.location.trim(),
        arrangement: values.arrangement,
        compensation: values.compensation.trim(),
        deadline: values.deadline || "",
        applicationUrl: values.applicationUrl.trim(),
        skills: values.skills.trim(),
        description: values.description.trim(),
        status: "Open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create guild opportunity:", error);
      setError("root.server", { type: "server", message: "The opportunity could not be saved. Check your permissions and try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) setOpen(nextOpen); }}>
      <DialogTrigger render={<Button type="button" className="gap-2 bg-amber-400 text-black hover:bg-amber-300"><BriefcaseBusiness className="size-4" aria-hidden="true" />Add opportunity</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add an opportunity</DialogTitle>
          <DialogDescription>Publish a job, contract, gig, grant, or bounty for the guild community.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(createOpportunity)} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="opportunity-title">Opportunity title <span className="text-primary">*</span></Label>
            <Input id="opportunity-title" placeholder="Smart contract engineer" aria-invalid={Boolean(errors.title)} {...register("title", { required: "Enter an opportunity title.", maxLength: { value: 120, message: "Use 120 characters or fewer." } })} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity-organization">Company or sponsor <span className="text-primary">*</span></Label>
            <Input id="opportunity-organization" placeholder="Organization name" aria-invalid={Boolean(errors.organization)} {...register("organization", { required: "Enter a company or sponsor.", maxLength: { value: 120, message: "Use 120 characters or fewer." } })} />
            {errors.organization && <p className="text-xs text-destructive">{errors.organization.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Opportunity type</Label>
            <Select value={type} onValueChange={(value) => setValue("type", value ?? "Full-time", { shouldDirty: true })}>
              <SelectTrigger aria-label="Opportunity type" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{opportunityTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Work arrangement</Label>
            <Select value={arrangement} onValueChange={(value) => setValue("arrangement", value ?? "Remote", { shouldDirty: true })}>
              <SelectTrigger aria-label="Work arrangement" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{arrangements.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-location">Location or time zone</Label>
            <Input id="opportunity-location" placeholder="Remote / Lagos, WAT" {...register("location", { maxLength: 120 })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunity-compensation">Compensation</Label>
            <Input id="opportunity-compensation" placeholder="e.g. $60–80k, fixed bounty" {...register("compensation", { maxLength: 120 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-deadline">Application deadline</Label>
            <Input id="opportunity-deadline" type="date" {...register("deadline")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="opportunity-url">Application link</Label>
            <Input id="opportunity-url" type="url" placeholder="https://…" aria-invalid={Boolean(errors.applicationUrl)} {...register("applicationUrl", { validate: (value) => !value || /^https?:\/\//i.test(value.trim()) || "Enter a valid http or https URL." })} />
            {errors.applicationUrl && <p className="text-xs text-destructive">{errors.applicationUrl.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="opportunity-skills">Skills or focus areas</Label>
            <Input id="opportunity-skills" placeholder="Solidity, DeFi, community management…" {...register("skills", { maxLength: 400 })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="opportunity-description">Description</Label>
            <Textarea id="opportunity-description" placeholder="Share the responsibilities, requirements, and how members can apply." className="min-h-28 resize-y" {...register("description", { maxLength: { value: 1600, message: "Use 1,600 characters or fewer." } })} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {errors.root?.server && <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors.root.server.message}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-black hover:bg-amber-300">{isSubmitting ? "Saving…" : "Publish opportunity"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
