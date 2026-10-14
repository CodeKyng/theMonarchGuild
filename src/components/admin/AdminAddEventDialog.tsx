import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CalendarDays, CalendarPlus } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/firebase";

interface AddEventValues {
  title: string;
  presenter: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  ticketLink: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function serializeDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function EventField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}

export default function AdminAddEventDialog({
  onEventAdded,
}: {
  onEventAdded: () => void;
}) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddEventValues>({
    defaultValues: {
      title: "",
      presenter: "The Monarch Guild",
      date: "",
      time: "",
      venue: "",
      description: "",
      ticketLink: "",
    },
  });
  const selectedDate = parseDate(useWatch({ control, name: "date" }) ?? "");

  if (role !== "admin") return null;

  const createEvent: SubmitHandler<AddEventValues> = async (values) => {
    if (role !== "admin" || !user) {
      setError("root.server", { type: "permission", message: "Only signed-in admins can add events." });
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title: values.title.trim(),
        presenter: values.presenter.trim() || "The Monarch Guild",
        date: values.date || "",
        time: values.time.trim(),
        venue: values.venue.trim(),
        description: values.description.trim(),
        ticketLink: values.ticketLink.trim(),
        status: "Upcoming",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      reset();
      setCalendarOpen(false);
      setOpen(false);
      onEventAdded();
    } catch (error) {
      console.error("Failed to create guild event:", error);
      setError("root.server", {
        type: "server",
        message: "The event could not be saved. Check your permissions and try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) setCalendarOpen(false);
    }}>
      <DialogTrigger
        render={
          <Button type="button" size="sm" className="gap-2 bg-amber-400 text-black hover:bg-amber-300">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Add event
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a guild event</DialogTitle>
          <DialogDescription>
            Add an event to the guild calendar. It will be visible on the public events page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(createEvent)} noValidate className="grid gap-4">
          <EventField label="Event title" error={errors.title?.message}>
            <Input
              autoFocus
              placeholder="Community meetup"
              aria-invalid={Boolean(errors.title)}
              {...register("title", {
                required: "Enter an event title.",
                maxLength: { value: 120, message: "Use 120 characters or fewer." },
              })}
            />
          </EventField>

          <div className="grid gap-4 sm:grid-cols-2">
            <EventField label="Presenter">
              <Input placeholder="The Monarch Guild" {...register("presenter")} />
            </EventField>
            <EventField label="Date">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 font-normal"
                aria-label="Choose event date"
                aria-haspopup="dialog"
                aria-expanded={calendarOpen}
                onClick={() => setCalendarOpen((isOpen) => !isOpen)}
              >
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                {selectedDate
                  ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(selectedDate)
                  : "Choose a date"}
              </Button>
              {calendarOpen && (
                <div className="mt-2 w-fit max-w-full overflow-x-auto rounded-xl border bg-popover">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setValue("date", date ? serializeDate(date) : "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setCalendarOpen(false);
                    }}
                  />
                </div>
              )}
            </EventField>
            <EventField label="Time">
              <Input type="time" {...register("time")} />
            </EventField>
            <EventField label="Venue or location">
              <Input placeholder="Online or venue name" {...register("venue")} />
            </EventField>
          </div>

          <EventField label="Description" error={errors.description?.message}>
            <textarea
              rows={3}
              placeholder="What should attendees know?"
              className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              {...register("description", { maxLength: { value: 1000, message: "Use 1,000 characters or fewer." } })}
            />
          </EventField>

          <EventField label="Ticket link (optional)" error={errors.ticketLink?.message}>
            <Input
              type="url"
              placeholder="https://…"
              aria-invalid={Boolean(errors.ticketLink)}
              {...register("ticketLink", {
                validate: (value) => !value || /^https?:\/\//i.test(value.trim()) || "Enter a valid http or https URL.",
              })}
            />
          </EventField>

          {errors.root?.server && <p role="alert" className="text-sm text-destructive">{errors.root.server.message}</p>}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-black hover:bg-amber-300">
              {isSubmitting ? "Saving event…" : "Save event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
