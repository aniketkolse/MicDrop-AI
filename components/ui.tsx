"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(timestamp: number | string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function nanoid(size = 10): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const byte of bytes) id += alphabet[byte % alphabet.length];
  return id;
}

// --- Button (Apple style) ---

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const buttonVariants: Record<string, string> = {
  primary: "bg-[#007AFF] text-white hover:bg-[#0066CC] shadow-sm",
  secondary: "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]",
  ghost: "bg-transparent text-[#007AFF] hover:bg-[#F5F5F7]",
  danger: "bg-[#FF3B30] text-white hover:bg-[#D70015]",
};

const buttonSizes: Record<string, string> = {
  sm: "h-9 px-3 text-[11px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

// --- Input ---

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#D2D2D7] bg-[#F5F5F7]/50 px-3 text-sm text-[#1D1D1F] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

// --- Textarea ---

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-xl border border-[#D2D2D7] bg-[#F5F5F7]/50 px-3 py-2.5 text-sm leading-relaxed text-[#1D1D1F] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// --- Select ---

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#D2D2D7] bg-[#F5F5F7]/50 px-3 pr-9 text-sm text-[#1D1D1F] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] appearance-none cursor-pointer disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

// --- Label ---

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <div className="mb-2">
      <label className={cn("block text-xs font-medium text-[#1D1D1F] uppercase tracking-wider mb-1", className)} {...props}>
        {children}
      </label>
      {hint ? <span className="text-[10px] text-[#86868B]">{hint}</span> : null}
    </div>
  );
}

// --- Badge ---

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "error" | "warning";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F]",
    primary: "bg-[#007AFF] text-white",
    success: "bg-[#34C759] text-white",
    error: "bg-[#FF3B30] text-white",
    warning: "bg-[#FF9500] text-white",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// --- Segmented control ---

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] p-1",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="group"
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg font-medium transition-colors",
            size === "sm" ? "h-8 text-[11px]" : "h-9 text-sm",
            value === option.value
              ? "bg-[#007AFF] text-white shadow-sm"
              : "text-[#1D1D1F] hover:bg-[#E5E5EA]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// --- Slider ---

export function Slider({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D2D2D7] accent-[#007AFF] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#007AFF]",
        className,
      )}
      {...props}
    />
  );
}

// --- Switch ---

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200",
        checked ? "border-[#34C759] bg-[#34C759]" : "border-[#D2D2D7] bg-[#F5F5F7]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-200",
          checked ? "translate-x-5 bg-white" : "translate-x-0.5 bg-white",
        )}
      />
    </button>
  );
}

// --- EmptyState ---

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D2D2D7] bg-[#F5F5F7]/50 px-8 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D2D2D7] bg-white text-[#007AFF]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1D1D1F]">{title}</h3>
      <p className="mt-2 max-w-sm text-[#86868B] text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

// --- Spinner ---

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent", className)}
    />
  );
}

// --- Card ---

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#D2D2D7] bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-[#1D1D1F]", className)} {...props} />;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
