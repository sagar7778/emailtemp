import * as React from "react";
import { cn } from "./utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-auto scrollbar-thin scrollbar-thumb-[hsl(var(--primary)/0.25)] scrollbar-track-transparent rounded-md",
        className
      )}
      tabIndex={0}
      aria-label="Scrollable content"
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";
