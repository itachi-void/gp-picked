"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext<any>(null);

export function Select({
  children,
  value,
  onValueChange,
  defaultValue,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (val: string) => void;
  defaultValue?: string;
}) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const changeValue = (val: string) => {
    setSelectedValue(val);
    if (onValueChange) onValueChange(val);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ selectedValue, changeValue, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      id={id}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer text-left shadow-sm",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { selectedValue } = React.useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({
  children,
  align = "start",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}) {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-1.5 z-50 min-w-[8rem] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 p-1 shadow-lg backdrop-blur-xl animate-in fade-in-80 slide-in-from-top-1 w-full",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0.5">{children}</div>;
}

export function SelectItem({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const { selectedValue, changeValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => changeValue(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-1.5 pl-8 pr-2 text-sm text-slate-700 dark:text-slate-300 outline-none hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-left",
        isSelected && "font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </button>
  );
}
