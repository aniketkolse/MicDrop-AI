"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";

export function Toast() {
  const { notice, dismissNotice } = useStudio();
  if (!notice) return null;

  const styles: Record<string, { border: string; icon: React.ElementType; color: string; bg: string }> = {
    success: { border: "border-green-500", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50/10" },
    error: { border: "border-destructive", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    info: { border: "border-ring", icon: Info, color: "text-ring", bg: "bg-blue-600/10" },
  } as const;

  const { border, icon: Icon, color, bg } = styles[notice.type];

  return (
    <div
      role="status"
      className={`fixed top-6 right-6 z-[70] flex max-w-sm items-start gap-3 rounded-lg ${border} ${bg} px-4 py-4 shadow-lg`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 ${color}" />
      <p className="text-sm leading-relaxed text-foreground">{notice.message}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label="Dismiss"
        className="ml-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
