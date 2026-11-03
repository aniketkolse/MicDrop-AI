"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";

export function Toast() {
  const { notice, dismissNotice } = useStudio();
  if (!notice) return null;

  const styles: Record<string, { border: string; icon: React.ElementType; color: string; bg: string }> = {
    success: { border: "border-[#16A34A]", icon: CheckCircle2, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
    error: { border: "border-[#DC2626]", icon: AlertTriangle, color: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
    info: { border: "border-[#7C3AED]", icon: Info, color: "text-[#7C3AED]", bg: "bg-[#FAF5FF]" },
  } as const;

  const { border, icon: Icon, color, bg } = styles[notice.type];

  return (
    <div
      role="status"
      className={`fixed top-6 right-6 z-[70] flex max-w-sm items-start gap-3 rounded-2xl ${border} ${bg} px-4 py-4 shadow-lg`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <p className="text-sm leading-relaxed text-[#1C1917]">{notice.message}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label="Dismiss"
        className="ml-1 text-[#78716C] hover:text-[#1C1917]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
