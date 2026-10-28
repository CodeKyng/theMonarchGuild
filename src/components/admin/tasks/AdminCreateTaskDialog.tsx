import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ListTodo } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import { taskPlatforms } from "@/components/tasks/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { cn } from "cn";
import { X } from "lucide-react";

interface TaskFormValues {
  title: string;
  description: string;
  instructions: string;
  platform: string;
  actionUrl: string;
  rewardAmount: string;
  maxCompletions: string;
}

export default function AdminCreateTaskDialog({ onCreated }: { onCreated: () => void }) {
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
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      platform: "X",
      actionUrl: "",
      rewardAmount: "10",
      maxCompletions: "",
    },
  });
  const platform = useWatch({ control, name: "platform" });

  const createTask: SubmitHandler<TaskFormValues> = async (values) => {
    if (role !== "admin" || !user) {
      setError("root.server", { type: "permission", message: "Only signed-in admins can create tasks." });
      return;
    }
    const reward = Number(values.rewardAmount);
    if (!Number.isFinite(reward) || reward <= 0) {
      setError("rewardAmount", { type: "validate", message: "Enter a positive reward amount." });
      return;
    }
    const max = values.maxCompletions.trim() === "" ? null : Number(values.maxCompletions);
    if (max != null && (!Number.isFinite(max) || max < 1)) {
      setError("maxCompletions", { type: "validate", message: "Max completions must be a positive number or empty." });
      return;
    }
    try {
      await addDoc(collection(db, "communityTasks"), {
        title: values.title.trim(),
        description: values.description.trim(),
        instructions: values.instructions.trim(),
        platform: values.platform,
        actionUrl: values.actionUrl.trim(),
        rewardAmount: reward,
        status: "Active",
        maxCompletions: max,
        completionCount: 0,
        createdBy: user.uid,
        createdByName: user.displayName || user.email || "Admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create community task:", error);
      setError("root.server", { type: "server", message: "The task could not be saved. Check permissions and try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isSubmitting) setOpen(next); }}>
      <DialogTrigger
        render={
          <Button type="button" className="gap-2 bg-amber-400 text-black hover:bg-amber-300">
            <ListTodo className="size-4" aria-hidden="true" />
            Create task
          </Button>
        }
      />

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0"
        />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl outline-none",
            "max-h-[min(90vh,44rem)]",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          {/* Sticky header */}
          <div className="shrink-0 border-b border-border px-6 pt-6 pb-4 pr-12">
            <DialogHeader>
              <DialogTitle>Create a community task</DialogTitle>
              <DialogDescription>
                Add an X, Telegram, or other social task. Members complete it, staff verify proof, then you transfer TMG tokens from your connected wallet.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable form body — fixed height so ScrollBar always works */}
          <ScrollArea className="min-h-0 flex-1">
            <form
              id="admin-create-task-form"
              onSubmit={handleSubmit(createTask)}
              noValidate
              className="grid gap-4 px-6 py-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="task-title">
                  Task title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="task-title"
                  placeholder="Follow @themonarchTMG on X"
                  aria-invalid={Boolean(errors.title)}
                  {...register("title", {
                    required: "Enter a task title.",
                    maxLength: { value: 140, message: "Use 140 characters or fewer." },
                  })}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={platform}
                  onValueChange={(value) => setValue("platform", value ?? "X", { shouldDirty: true })}
                >
                  <SelectTrigger aria-label="Platform" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskPlatforms.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-reward">
                  Reward (TMG) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="task-reward"
                  type="number"
                  min="0.000001"
                  step="any"
                  placeholder="10"
                  aria-invalid={Boolean(errors.rewardAmount)}
                  {...register("rewardAmount", { required: "Enter a reward amount." })}
                />
                {errors.rewardAmount && (
                  <p className="text-xs text-destructive">{errors.rewardAmount.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="task-url">
                  Action URL <span className="text-primary">*</span>
                </Label>
                <Input
                  id="task-url"
                  type="url"
                  placeholder="https://x.com/themonarchTMG or t.me/..."
                  aria-invalid={Boolean(errors.actionUrl)}
                  {...register("actionUrl", {
                    required: "Enter the link members should open.",
                    validate: (v) =>
                      /^https?:\/\//i.test(v.trim()) || "Enter a valid http or https URL.",
                  })}
                />
                {errors.actionUrl && (
                  <p className="text-xs text-destructive">{errors.actionUrl.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="task-description">Short description</Label>
                <Input
                  id="task-description"
                  placeholder="What members get for completing this"
                  {...register("description", { maxLength: 300 })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="task-instructions">
                  Instructions for members <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="task-instructions"
                  placeholder={"1. Open the link\n2. Follow / join / like\n3. Paste proof (screenshot or profile link)"}
                  className="min-h-28 resize-y"
                  aria-invalid={Boolean(errors.instructions)}
                  {...register("instructions", {
                    required: "Explain how to complete the task.",
                    maxLength: { value: 2000, message: "Use 2,000 characters or fewer." },
                  })}
                />
                {errors.instructions && (
                  <p className="text-xs text-destructive">{errors.instructions.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="task-max">Max completions (optional)</Label>
                <Input
                  id="task-max"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  {...register("maxCompletions")}
                />
                {errors.maxCompletions && (
                  <p className="text-xs text-destructive">{errors.maxCompletions.message}</p>
                )}
              </div>

              {errors.root?.server && (
                <p role="alert" className="text-sm text-destructive sm:col-span-2">
                  {errors.root.server.message}
                </p>
              )}
            </form>
          </ScrollArea>

          {/* Sticky footer */}
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-create-task-form"
              disabled={isSubmitting}
              className="bg-amber-400 text-black hover:bg-amber-300"
            >
              {isSubmitting ? "Saving…" : "Publish task"}
            </Button>
          </div>

          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
