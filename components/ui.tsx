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
    month: "long",
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

// --- Button (Luxury) ---

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const buttonVariants: Record<string, string> = {
  primary: "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-luxury",
  secondary: "bg-[#F3F4F6] text-[#1C1917] hover:bg-[#E7E5E4]",
  ghost: "bg-transparent text-[#7C3AED] hover:bg-[#F3F4F6]",
  danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
  outline: "border border-[#E7E5E4] bg-transparent text-[#1C1917] hover:bg-[#F3F4F6]",
};

const buttonSizes: Record<string, string> = {
  sm: "h-9 px-3 text-[11px] font-medium",
  md: "h-10 px-4 text-sm font-medium",
  lg: "h-11 px-6 text-sm font-medium",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/20 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
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
        "flex h-10 w-full rounded-xl border border-[#E7E5E4] bg-transparent px-3 text-sm text-[#1C1917] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] disabled:opacity-40 placeholder:text-[#A8A29E]",
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
      "flex w-full rounded-xl border border-[#E7E5E4] bg-transparent px-3 py-2.5 text-sm leading-relaxed text-[#1C1917] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] disabled:opacity-40 placeholder:text-[#A8A29E]",
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
        "flex h-10 w-full rounded-xl border border-[#E7E5E4] bg-transparent px-3 pr-9 text-sm text-[#1C1917] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] appearance-none cursor-pointer disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]"
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
      <label className={cn("block text-xs font-semibold text-[#5C5452] uppercase tracking-wider mb-1", className)} {...props}>
        {children}
      </label>
      {hint ? <span className="text-[10px] text-[#94A3B8]">{hint}</span> : null}
    </div>
  );
}

// --- Badge ---

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "error" | "warning";
  size?: "sm" | "md";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-[#E7E5E4] bg-[#F3F4F6] text-[#5C5452]",
    primary: "bg-[#7C3AED] text-white",
    success: "bg-[#16A34A] text-white",
    error: "bg-[#DC2626] text-white",
    warning: "bg-[#C5A059] text-white",
  } as const;
  const sizes: Record<string, string> = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[10.5px]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-medium transition-colors",
        tones[tone],
        sizes[size],
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
        "grid gap-1 rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] p-1",
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
            "rounded-lg font-medium transition-all duration-200",
            size === "sm" ? "h-8 text-[11px]" : "h-9 text-sm",
            value === option.value
              ? "bg-[#7C3AED] text-white shadow-sm"
              : "text-[#1C1917] hover:bg-[#F3F4F6]",
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
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D6D3D1] accent-[#7C3AED] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7C3AED]",
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
        checked ? "border-[#16A34A] bg-[#16A34A]" : "border-[#E7E5E4] bg-[#F3F4F6]",
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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E7E5E4] bg-[#F8F9FC]/50 px-8 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E7E5E4] bg-white text-[#7C3AED] shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1C1917] tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-[#78716C] text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
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

export function Card({ children, className, padding = "p-6" }: { children: React.ReactNode; className?: string; padding?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#E7E5E4] bg-white shadow-sm",
        padding,
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
  return <h3 className={cn("text-lg font-semibold text-[#1C1917] tracking-tight", className)} {...props} />;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
