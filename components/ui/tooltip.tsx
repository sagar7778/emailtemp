import * as React from "react";
import { cn } from "./utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  return (
    <span className="relative inline-block">
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        tabIndex: 0,
        'aria-describedby': open ? 'tooltip' : undefined,
      })}
      {open && (
        <div
          role="tooltip"
          id="tooltip"
          className={cn(
            "absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded bg-[hsl(var(--primary))] text-white text-xs shadow-glow animate-fade-in",
            className
          )}

        >
          {content}
        </div>
      )}
    </span>
  );
};
