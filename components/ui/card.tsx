import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background shadow-elev p-6",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
