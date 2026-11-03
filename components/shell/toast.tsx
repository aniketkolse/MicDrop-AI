"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";

export function Toast() {
  const { notice, dismissNotice } = useStudio();
  if (!notice) return null;

  const styles = {
    success: { border: "border-[#245844]", icon: CheckCircle2, color: "text-success" },
    error: { border: "border-[#5B2B33]", icon: AlertTriangle, color: "text-error" },
    info: { border: "border-[#3A3450]", icon: Info, color: "text-primary" },
  } as const;

  const { border, icon: Icon, color } = styles[notice.type];

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[70] flex max-w-sm items-start gap-2.5 rounded-xl border ${border} bg-[#1B1B22] px-3.5 py-3 shadow-2xl lg:right-6 lg:top-6`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <p className="text-[12.5px] leading-relaxed text-text-primary">{notice.message}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label="Dismiss"
        className="ml-1 text-[#6D6D7B] hover:text-text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
