import * as React from "react";
import { cn } from "./utils";

export interface DropdownProps {
  label: string;
  items: { label: string; onClick: () => void }[];
}

export const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-white shadow-elev focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
      >
        {label}
        <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
      </button>
      {open && (
        <ul
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-elev ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          {items.map((item, i) => (
            <li
              key={i}
              role="menuitem"
              tabIndex={0}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-[hsl(var(--primary)/0.08)] cursor-pointer rounded"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  item.onClick();
                  setOpen(false);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
