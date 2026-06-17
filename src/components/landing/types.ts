import React from "react";

/* -------------------------------------------------------------------------- */
/*                               Tailwind Helpers                             */
/* -------------------------------------------------------------------------- */
export const colorBg: Record<string, string> = {
  emerald: "bg-emerald-100",
  blue: "bg-blue-100",
  amber: "bg-amber-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
  teal: "bg-teal-100",
  cyan: "bg-cyan-100",
};

export const colorText: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  green: "text-green-600",
  purple: "text-purple-600",
  teal: "text-teal-600",
  cyan: "text-cyan-600",
};

export const colorBtnFrom: Record<string, string> = {
  emerald: "from-emerald-600",
  blue: "from-blue-600",
  purple: "from-purple-600",
};

export const colorBtnTo: Record<string, string> = {
  emerald: "to-emerald-700",
  blue: "to-blue-700",
  purple: "to-purple-700",
};

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */
export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type Stat = {
  icon: IconType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
};

export type FeatureT = {
  icon: IconType;
  name: string;
  accuracy: number;
  description: string;
};

export type StepT = {
  icon: IconType;
  title: string;
  description: string;
};

export type RoleT = {
  icon: IconType;
  title: "Citizen" | "Driver" | "Admin";
  description: string;
  features: string[];
  color: string;
};

export type ImpactEqT = {
  icon: IconType;
  text: string;
};

export type ImpactStatT = {
  icon: IconType;
  label: string;
  value: string;
  subtitle: string;
};
