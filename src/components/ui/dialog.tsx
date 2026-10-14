import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0", className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  scrollAreaClassName,
  children,
  ...props
}: DialogPrimitive.Popup.Props & { scrollAreaClassName?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn("fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background p-3 text-foreground shadow-2xl outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-3", className)}
        {...props}
      >
        <ScrollArea className={cn("max-h-[calc(100svh-3.5rem)] px-3 py-3 sm:px-4", scrollAreaClassName)}>
          <div className="grid gap-4">{children}</div>
        </ScrollArea>
        <DialogPrimitive.Close
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return <DialogPrimitive.Description className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
