import * as React from "react";
import { cn } from "./utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-[hsl(var(--primary)/0.08)]",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
