"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Optional dialog description */
  description?: string;
  /** Form content (fields) */
  children: ReactNode;
  /** Submit button text */
  submitLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  /** Optional callback when cancel is clicked */
  onCancel?: () => void;
  /** Whether submit button should be disabled */
  submitDisabled?: boolean;
  /** Dialog content class name for custom sizing */
  contentClassName?: string;
}

/**
 * Reusable dialog component for forms
 *
 * Provides consistent styling and behavior for modal forms:
 * - Header with title and optional description
 * - Form content area
 * - Footer with cancel and submit buttons
 * - Loading state handling
 *
 * @example
 * <FormDialog
 *   open={dialog.isOpen}
 *   onOpenChange={dialog.setIsOpen}
 *   title="Add Family Member"
 *   description="Enter the details for the new family member."
 *   onSubmit={handleSubmit}
 *   isSubmitting={form.isSubmitting}
 * >
 *   <div className="space-y-4">
 *     <Input label="Name" {...form.getInputProps("name")} />
 *     <Input label="Email" {...form.getInputProps("email")} />
 *   </div>
 * </FormDialog>
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitDisabled = false,
  contentClassName,
}: FormDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="py-4">{children}</div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting || submitDisabled}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
