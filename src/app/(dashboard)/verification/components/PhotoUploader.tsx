"use client";

import { useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { PhotoPreview } from "./PhotoPreview";

interface PhotoUploaderProps {
  previewUrl: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PhotoUploader({ previewUrl, onFileSelect }: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="text-xs text-slate-400 dark:text-white/40 mb-2 flex items-center gap-1.5 font-bold" style={{ fontWeight: 700 }}>
        <Camera className="w-3.5 h-3.5" /> SNAP RECEIVED BAG BOTTLES
      </div>
      <PhotoPreview photoUrl={previewUrl} emptyLabel="Photograph the bag details to verify" />
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 cursor-pointer transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> Take / Upload Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={onFileSelect}
        />
      </div>
    </div>
  );
}
