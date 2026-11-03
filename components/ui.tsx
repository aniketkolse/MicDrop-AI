"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-[#15121F] hover:bg-[#B9A2FF] active:bg-[#9678F0] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]",
  secondary:
    "bg-surface-2 text-text-primary border border-border hover:border-[#454553] hover:bg-[#26262F]",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-2",
  danger: "bg-[#3A1D24] text-error border border-[#5A2A34] hover:bg-[#4A242D]",
  subtle: "bg-[#242230] text-primary border border-[#3A3450] hover:bg-[#2C293B]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[13.5px] gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-lg",
  icon: "h-8 w-8 rounded-lg justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-45 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-[#131318] px-3 text-sm text-text-primary placeholder:text-[#5C5C68] outline-none transition-colors focus:border-[#57506F] focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none rounded-lg border border-border bg-[#131318] px-3 py-2.5 text-sm leading-relaxed text-text-primary placeholder:text-[#5C5C68] outline-none transition-colors focus:border-[#57506F] focus:ring-2 focus:ring-primary/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-10 w-full appearance-none rounded-lg border border-border bg-[#131318] px-3 pr-8 text-sm text-text-primary outline-none transition-colors focus:border-[#57506F] focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label className={cn("text-[12px] font-medium tracking-wide text-text-secondary", className)} {...props}>
        {children}
      </label>
      {hint ? <span className="text-[10.5px] text-[#6B6B78]">{hint}</span> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "error" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-surface-2 text-text-secondary",
    primary: "border-[#3D3556] bg-[#241F33] text-primary",
    success: "border-[#1F4A3C] bg-[#142B24] text-success",
    error: "border-[#532A30] bg-[#2E191D] text-error",
    warning: "border-[#4A3B20] bg-[#2B2314] text-[#E5B567]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

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
        "grid gap-1 rounded-lg border border-border bg-[#131318] p-1",
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
            "rounded-md font-medium transition-colors",
            size === "sm" ? "h-7 text-[11.5px]" : "h-8 text-[12.5px]",
            value === option.value
              ? "bg-[#2B2638] text-text-primary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
              : "text-[#77778A] hover:text-text-secondary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2B2B35] accent-[#A78BFA] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]",
        className,
      )}
      {...props}
    />
  );
}

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
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
        checked ? "border-primary/50 bg-primary/80" : "border-border bg-[#2A2A34]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform",
          checked ? "translate-x-[18px] bg-[#17131F]" : "translate-x-0.5 bg-[#8A8A99]",
        )}
      />
    </button>
  );
}

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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent",
        className,
      )}
    />
  );
}
