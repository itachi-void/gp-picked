"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  children,
  orientation = "horizontal",
  className,
}: {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 items-center",
        orientation === "vertical" ? "flex-col items-start" : "flex-row",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FieldLabel({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-slate-600 dark:text-slate-400 select-none whitespace-nowrap",
        className
      )}
    >
      {children}
    </label>
  );
}
