import * as React from "react";
import { cn } from "./utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "hero";
};

const variantClasses = {
  default: "bg-[hsl(var(--primary))] text-white shadow-elev hover:bg-[hsl(var(--primary-glow))]",
  outline: "border border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-transparent hover:bg-[hsl(var(--primary)/0.05)]",
  ghost: "bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]",
  hero: "bg-gradient-to-r from-[hsl(var(--gradient-primary))] text-white shadow-[var(--shadow-glow)] font-bold border-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", type = "button", ...props }, ref) => (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      ref={ref}
      aria-pressed={props['aria-pressed']}
      {...props}
    />
  )
);
Button.displayName = "Button";
