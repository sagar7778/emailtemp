import * as React from "react";
import { cn } from "./utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  message: string;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ open, onClose, message, duration = 3000, className, ...props }) => {
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 right-4 z-50 min-w-[200px] max-w-xs rounded-lg bg-[hsl(var(--primary))] text-white px-4 py-3 shadow-glow animate-fade-in",
        className
      )}
      {...props}
    >
      {message}
      <button
        onClick={onClose}
        aria-label="Close"
        className="ml-4 text-white/80 hover:text-white focus-visible:outline-none"
      >
        ×
      </button>
    </div>
  );
};

// Minimal placeholder Toaster provider. Can be extended later to manage a toast queue.
export const Toaster: React.FC = () => null;
