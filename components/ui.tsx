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

// --- Button ---

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const buttonVariants: Record<string, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:bg-accent",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-transparent text-foreground hover:bg-accent",
};

const buttonSizes: Record<string, string> = {
  sm: "h-8 px-3 text-xs font-medium",
  md: "h-10 px-4 text-sm font-medium",
  lg: "h-11 px-6 text-sm font-medium",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-ping rounded-full border-[2px] border-current border-t-transparent opacity-75" />
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
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-40 placeholder:text-muted-foreground transition-colors",
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
      "flex w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-40 placeholder:text-muted-foreground transition-colors",
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
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 pr-9 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring appearance-none cursor-pointer disabled:opacity-40 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
      <label className={cn("block text-xs font-semibold text-muted-foreground tracking-tight uppercase mb-1", className)} {...props}>
        {children}
      </label>
      {hint ? <span className="mt-0.5 text-[11px] text-muted-foreground">{hint}</span> : null}
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
    neutral: "border border-accent bg-accent text-accent-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "bg-green-500 text-white",
    error: "bg-destructive text-destructive-foreground",
    warning: "bg-amber-500 text-white",
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
        "grid gap-1 rounded-md border border-input bg-secondary p-1",
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
            "rounded-md font-medium transition-colors duration-150",
            size === "sm" ? "h-8 text-[11px]" : "h-9 text-sm",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground hover:bg-secondary/50",
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
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-accent/40 accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
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
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-150",
        checked ? "border-primary bg-primary" : "border-input bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-150",
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-accent/50 bg-secondary/30 px-8 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

// --- Spinner ---

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-4 w-4 animate-ping rounded-full border-[2px] border-current border-t-transparent", className)}
    />
  );
}

// --- Card ---

export function Card({ children, className, padding = "p-6" }: { children: React.ReactNode; className?: string; padding?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-input bg-card shadow-sm",
        padding,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1 px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-foreground tracking-tight", className)} {...props} />;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

// --- Separator ---

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-accent mx-auto", className)} />;
}
