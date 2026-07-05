"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { TrendingUp } from "lucide-react";

// simple data
const data = [
  { day: "Sun", PET: 245, HDPE: 180, Other: 95 },
  { day: "Mon", PET: 312, HDPE: 210, Other: 102 },
  { day: "Tue", PET: 280, HDPE: 195, Other: 88 },
  { day: "Wed", PET: 398, HDPE: 245, Other: 115 },
  { day: "Thu", PET: 425, HDPE: 268, Other: 128 },
  { day: "Fri", PET: 356, HDPE: 222, Other: 109 },
  { day: "Sat", PET: 290, HDPE: 198, Other: 95 },
];

export default function WasteStreamChart() {
  const [isAreaChart, setIsAreaChart] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  
  const strokePET = isDark ? "#00E5FF" : "#0891B2";
  const strokeHDPE = isDark ? "#C084FC" : "#7C3AED";
  const strokeOther = isDark ? "#FBBF24" : "#D97706";

  return (
    <div className="w-full h-full flex flex-col gap-6 font-sans text-black dark:text-white transition-colors duration-300">
      
      {/* Top Metrics & Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-border">
        {/* KPIs Capsule Grid */}
        <div className="grid grid-cols-3 gap-4 w-full md:max-w-lg">
          <div className="bg-muted border border-border p-4 rounded-2xl flex flex-col justify-between text-foreground transition-colors duration-300">
            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest leading-none mb-1.5">Total Weight</span>
            <span className="text-base font-black text-foreground leading-none tracking-tight">4,756 kg</span>
          </div>
          <div className="bg-muted border border-border p-4 rounded-2xl flex flex-col justify-between text-foreground transition-colors duration-300">
            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest leading-none mb-1.5">Daily Avg</span>
            <span className="text-base font-black text-foreground leading-none tracking-tight">679 kg</span>
          </div>
          <div className="bg-primary/10 border border-transparent p-4 rounded-2xl flex flex-col justify-between transition-colors duration-300">
            <span className="text-[9px] text-primary font-extrabold uppercase tracking-widest leading-none mb-1.5">Peak Day</span>
            <span className="text-base font-black text-primary leading-none tracking-tight">Thursday</span>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsAreaChart(!isAreaChart)}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          {isAreaChart ? "Show Line Chart" : "Show Area Chart"}
        </button>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {isAreaChart ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPET" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokePET} stopOpacity={isDark ? 0.35 : 0.25}/>
                  <stop offset="95%" stopColor={strokePET} stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorHDPE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeHDPE} stopOpacity={isDark ? 0.35 : 0.25}/>
                  <stop offset="95%" stopColor={strokeHDPE} stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeOther} stopOpacity={isDark ? 0.3 : 0.2}/>
                  <stop offset="95%" stopColor={strokeOther} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 'bold'}} />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#161B20' : '#FFFFFF', 
                  borderRadius: '20px', 
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)', 
                  boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
                  color: isDark ? '#FFFFFF' : '#0F1215',
                  fontWeight: 'bold',
                }}
              />
              
              <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="PET" stackId="1" stroke={strokePET} fill="url(#colorPET)" strokeWidth={3} />
              <Area type="monotone" dataKey="HDPE" stackId="1" stroke={strokeHDPE} fill="url(#colorHDPE)" strokeWidth={3} />
              <Area type="monotone" dataKey="Other" stackId="1" stroke={strokeOther} fill="url(#colorOther)" strokeWidth={3} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 'bold'}} />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#161B20' : '#FFFFFF', 
                  borderRadius: '20px', 
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)', 
                  boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
                  color: isDark ? '#FFFFFF' : '#0F1215',
                  fontWeight: 'bold',
                }}
              />
              
              <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="PET" stroke={strokePET} strokeWidth={3.5} dot={{ r: 5, strokeWidth: 2, fill: isDark ? '#0F1215' : '#FFFFFF' }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="HDPE" stroke={strokeHDPE} strokeWidth={3.5} dot={{ r: 5, strokeWidth: 2, fill: isDark ? '#0F1215' : '#FFFFFF' }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="Other" stroke={strokeOther} strokeWidth={3.5} dot={{ r: 5, strokeWidth: 2, fill: isDark ? '#0F1215' : '#FFFFFF' }} activeDot={{ r: 7 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}