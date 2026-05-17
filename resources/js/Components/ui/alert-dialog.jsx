import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const AlertDialog = React.forwardRef(({ ...props }, ref) => (
  <AlertDialogPrimitive.Root ref={ref} data-slot="alert-dialog" {...props} />
));
AlertDialog.displayName = "AlertDialog";

const AlertDialogTrigger = React.forwardRef(({ ...props }, ref) => (
  <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />
));
AlertDialogTrigger.displayName = "AlertDialogTrigger";

const AlertDialogPortal = React.forwardRef(({ ...props }, ref) => (
  <AlertDialogPrimitive.Portal ref={ref} data-slot="alert-dialog-portal" {...props} />
));
AlertDialogPortal.displayName = "AlertDialogPortal";

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef(({ className, size = "default", ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      data-size={size}
      className={cn(
        "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-header"
    className={cn(
      "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
      className
    )}
    {...props}
  />
));
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-footer"
    className={cn(
      "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogMedia = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-media"
    className={cn(
      "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
      className
    )}
    {...props}
  />
));
AlertDialogMedia.displayName = "AlertDialogMedia";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn(
      "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
      className
    )}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn(
      "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
      className
    )}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} data-slot="alert-dialog-action" asChild>
    <Button variant={variant} size={size} className={cn(className)} {...props} />
  </AlertDialogPrimitive.Action>
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, variant = "outline", size = "default", ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} data-slot="alert-dialog-cancel" asChild>
    <Button variant={variant} size={size} className={cn(className)} {...props} />
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
