"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
  onError?: (error: Error, info: string) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo: errorInfo.componentStack ?? "" });
    this.props.onError?.(error, errorInfo.componentStack ?? "");
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return React.createElement(this.props.fallback, this.state);
      }
      return (
        <div
          className="flex flex-col items-center justify-center rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-8 text-center"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FCA5A5] bg-[#FFF5F5] text-[#DC2626]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1917] mb-2">Something went wrong</h2>
          <p className="text-[#78716C] text-sm mb-6">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundaryFallback(props: ErrorBoundaryState) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FCA5A5] bg-[#FFF5F5] text-[#DC2626]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-[#1C1917] mb-2">Something went wrong</h2>
      <p className="text-[#78716C] text-sm mb-6">
        {props.error?.message || "An unexpected error occurred."}
      </p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload page
      </Button>
    </div>
  );
}
