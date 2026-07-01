"use client";

import React from "react";
import { Camera } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface EcoSnapCardProps {
  uploadingSnap: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  snapFileRef: React.RefObject<HTMLInputElement | null>;
}

export function EcoSnapCard({
  uploadingSnap,
  onUpload,
  snapFileRef,
}: EcoSnapCardProps) {
  return (
    <div data-aos="fade-up" data-aos-delay="50">
      <GlassCard className="p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Camera className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">EcoSnap Verification</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload a photo of your recycled trash bag or bottles to get instant verification and points.
              </p>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => snapFileRef.current?.click()}
              disabled={uploadingSnap}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {uploadingSnap ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Snap & Verify
                </>
              )}
            </button>
            <input
              ref={snapFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={onUpload}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
