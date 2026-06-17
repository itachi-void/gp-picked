"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { RoleT, colorBg, colorText, colorBtnFrom, colorBtnTo } from "./types";
import { useIntersection } from "./useIntersection";

interface RoleCardProps {
  role: RoleT;
  index: number;
}

export function RoleCard({ role, index }: RoleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(ref);
  const Icon = role.icon;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 150}ms` }}
      className={`bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent cursor-pointer role-card-transition ${
        isIntersecting ? "role-card-active" : "role-card-enter"
      }`}
    >
      <div
        className={`w-16 h-16 ${
          colorBg[role.color] || "bg-emerald-100"
        } rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform duration-500 ease-out hover:scale-120`}
      >
        <Icon className={`w-8 h-8 ${colorText[role.color] || "text-emerald-600"}`} />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
        {role.title}
      </h3>
      <p className="text-gray-600 text-center mb-6">{role.description}</p>

      <ul className="space-y-3 mb-6">
        {role.features.map((feature, i) => (
          <li
            key={i}
            style={{
              transitionDelay: `${index * 100 + i * 100}ms`,
            }}
            className={`flex items-center gap-2 text-gray-700 transition-all duration-500 transform ${
              isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
            }`}
          >
            <CheckCircle
              className={`w-5 h-5 ${colorText[role.color] || "text-emerald-600"} flex-shrink-0`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
        <Link
          href={role.title === "Admin" ? "/dashboard" : "/citizen-portal"}
          className={`block w-full px-6 py-3 bg-gradient-to-r ${
            colorBtnFrom[role.color] || "from-emerald-600"
          } ${
            colorBtnTo[role.color] || "to-emerald-700"
          } text-white rounded-lg hover:shadow-lg transition-all text-center font-semibold`}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}