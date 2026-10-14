import { useState, type FormEvent } from "react";
import { BriefcaseBusiness, LoaderCircle, Save, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface ProfileData {
  displayName: string;
  professionalTitle: string;
  workType: string;
  experienceYears: string;
  skills: string;
  location: string;
  bio: string;
  interests: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  discordHandle: string;
}

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileData;
  email: string;
  role: string;
  onSave: (data: ProfileData) => Promise<void>;
}

export function EditProfile({ isOpen, onClose, initialData, email, role, onSave }: EditProfileProps) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof ProfileData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(formData);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const field = (name: keyof ProfileData, label: string, placeholder: string, options: { required?: boolean; type?: string; maxLength?: number; min?: number; max?: number } = {}) => (
    <div className="space-y-2" key={name}>
      <Label htmlFor={`edit-profile-${name}`}>{label}{options.required && <span className="text-primary"> *</span>}</Label>
      <Input id={`edit-profile-${name}`} type={options.type ?? "text"} value={formData[name]} onChange={(event) => updateField(name, event.target.value)} placeholder={placeholder} required={options.required} maxLength={options.maxLength ?? 180} min={options.min} max={options.max} />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit your profile</DialogTitle>
          <DialogDescription>Keep your Guild profile current so people can discover your work and connect with you.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="size-4 text-primary" />Work and experience</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="edit-profile-email">Account email</Label><Input id="edit-profile-email" value={email} readOnly disabled /><p className="text-xs text-muted-foreground">Your sign-in email is managed by your authentication provider.</p></div>
              <div className="space-y-2"><Label htmlFor="edit-profile-role">Workspace role</Label><Input id="edit-profile-role" value={role} readOnly disabled className="capitalize" /><p className="text-xs text-muted-foreground">Workspace access is managed by the guild team.</p></div>
              {field("displayName", "Display name", "Your name", { required: true, maxLength: 100 })}
              {field("professionalTitle", "What do you do?", "e.g. Smart contract developer", { required: true })}
              <div className="space-y-2"><Label>Work type <span className="text-primary">*</span></Label><Select value={formData.workType || null} onValueChange={(value) => updateField("workType", value ?? "")}><SelectTrigger className="w-full" aria-label="Work type"><SelectValue placeholder="Choose your focus" /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Freelance">Freelance</SelectItem><SelectItem value="Founder">Founder</SelectItem><SelectItem value="Student">Student</SelectItem><SelectItem value="Looking for opportunities">Looking for opportunities</SelectItem></SelectContent></Select></div>
              {field("experienceYears", "Years of experience", "0", { type: "number", required: true, min: 0, max: 80 })}
              {field("location", "Location or time zone", "e.g. Lagos, WAT / UTC+1", { required: true })}
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="edit-profile-skills">Skills <span className="text-primary">*</span></Label><Input id="edit-profile-skills" value={formData.skills} onChange={(event) => updateField("skills", event.target.value)} placeholder="Solidity, community management, design…" required maxLength={500} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="edit-profile-bio">About you</Label><Textarea id="edit-profile-bio" value={formData.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="What are you building, learning, or hoping to contribute?" className="min-h-24 resize-y" maxLength={1000} /></div>
              {field("interests", "Web3 interests", "DeFi, NFTs, DAOs, gaming…", { maxLength: 500 })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><UsersRound className="size-4 text-primary" />Community links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("websiteUrl", "Portfolio or website", "https://your-site.com", { type: "url" })}
              {field("linkedinUrl", "LinkedIn profile", "https://linkedin.com/in/you", { type: "url" })}
              {field("githubUrl", "GitHub profile", "https://github.com/you", { type: "url" })}
              {field("twitterUrl", "X / Twitter profile", "https://x.com/you", { type: "url" })}
              {field("discordHandle", "Discord username", "yourname", { maxLength: 100 })}
            </div>
          </section>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />}{saving ? "Saving…" : "Save profile"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
