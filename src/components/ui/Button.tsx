"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

    const variants = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-white shadow-sm focus-visible:outline-brand-600 active:scale-[0.99]",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus-visible:outline-slate-500 active:scale-[0.99]",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm focus-visible:outline-brand-500 active:scale-[0.99]",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:outline-red-600 active:scale-[0.99]",
      ghost:
        "hover:bg-slate-100 text-slate-700 focus-visible:outline-slate-400 active:scale-[0.99]",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
