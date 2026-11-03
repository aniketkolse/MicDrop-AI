"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";

export function Toast() {
  const { notice, dismissNotice } = useStudio();
  if (!notice) return null;

  const styles: Record<string, { border: string; icon: React.ElementType; color: string }> = {
    success: { border: "border-[#34C759]", icon: CheckCircle2, color: "text-[#34C759]" },
    error: { border: "border-[#FF3B30]", icon: AlertTriangle, color: "text-[#FF3B30]" },
    info: { border: "border-[#007AFF]", icon: Info, color: "text-[#007AFF]" },
  } as const;

  const { border, icon: Icon, color } = styles[notice.type];

  return (
    <div
      role="status"
      className={`fixed top-6 right-6 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border ${border} bg-white px-4 py-4 shadow-lg`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <p className="text-sm leading-relaxed text-[#1D1D1F]">{notice.message}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label="Dismiss"
        className="ml-1 text-[#86868B] hover:text-[#1D1D1F]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
