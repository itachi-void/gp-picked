"use client";

interface PhotoPreviewProps {
  photoUrl: string | null;
  emptyLabel?: string;
  small?: boolean;
}

export function PhotoPreview({ photoUrl, emptyLabel, small }: PhotoPreviewProps) {
  if (!photoUrl) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-xs text-slate-400 ${small ? "h-20" : "h-40"}`}>
        {emptyLabel}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className={`rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 relative ${small ? "h-16" : "h-40"}`}>
        <img src={photoUrl} alt="verification snapshot" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
