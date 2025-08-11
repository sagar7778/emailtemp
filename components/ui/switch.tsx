import * as React from "react";
import { cn } from "./utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, ...props }, ref) => (
    <label className={cn("inline-flex items-center cursor-pointer", disabled && "opacity-50 pointer-events-none")}> 
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onCheckedChange(e.target.checked)}
        ref={ref}
        className="sr-only"
        disabled={disabled}
        aria-checked={checked}
        {...props}
      />
      <span
        className={cn(
          "w-10 h-6 flex items-center bg-[hsl(var(--primary)/0.15)] rounded-full p-1 transition-colors",
          checked ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--primary)/0.15)]"
        )}
      >
        <span
          className={cn(
            "bg-white w-4 h-4 rounded-full shadow-elev transform transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </span>
    </label>
  )
);
Switch.displayName = "Switch";
