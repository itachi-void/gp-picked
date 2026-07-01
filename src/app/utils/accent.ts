export interface AccentConfig {
  bg: string;
  fg: string;
  border?: string;
  gradient?: string;
}

export const accentMap: Record<string, AccentConfig> = {
  slate: {
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    fg: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800/50",
    gradient: "from-slate-500 to-slate-700",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    fg: "text-sky-600 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800/50",
    gradient: "from-sky-500 to-sky-700",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    fg: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
    gradient: "from-emerald-500 to-teal-600",
  },
  teal: {
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    fg: "text-teal-600 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/50",
    gradient: "from-teal-500 to-teal-700",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    fg: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/50",
    gradient: "from-violet-500 to-violet-700",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    fg: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
    gradient: "from-amber-500 to-amber-700",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    fg: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/50",
    gradient: "from-rose-500 to-rose-700",
  },
  lime: {
    bg: "bg-lime-500/10 dark:bg-lime-500/20",
    fg: "text-lime-600 dark:text-lime-400",
    border: "border-lime-200 dark:border-lime-800/50",
    gradient: "from-lime-500 to-lime-700",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
    fg: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-200 dark:border-fuchsia-800/50",
    gradient: "from-fuchsia-500 to-fuchsia-700",
  },
};
