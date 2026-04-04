"use client";

import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[13px] font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3 py-2 text-[14px] bg-card border border-border rounded-[10px]",
            "placeholder:text-muted-foreground resize-none",
            "focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5",
            "transition-all duration-150",
            error && "border-danger focus:border-danger focus:ring-danger/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
