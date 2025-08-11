"use client";

import React from "react";
import type { MessageSummary } from "@/lib/providers/types";

export interface InboxListProps {
  messages: MessageSummary[];
  loading?: boolean;
  onSelect?: (id: string) => void;
  onRefresh?: () => void;
}

export default function InboxList({ messages, loading, onSelect, onRefresh }: InboxListProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!messages.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (activeIndex + 1) % messages.length;
      setActiveIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeIndex - 1 + messages.length) % messages.length;
      setActiveIndex(prev);
      itemRefs.current[prev]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = messages[activeIndex]?.id;
      if (id) onSelect?.(id);
    }
  };

  return (
    <div className="w-full" onKeyDown={onKeyDown} role="listbox" aria-label="Inbox messages">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Inbox</h3>
        <button onClick={onRefresh} className="text-xs underline" aria-label="Refresh">Refresh</button>
      </div>
      {loading && !messages.length ? (
        <div className="space-y-2" aria-live="polite">
          <div className="h-6 w-1/2 bg-[hsl(var(--primary)/0.08)] rounded" />
          <div className="h-6 w-3/4 bg-[hsl(var(--primary)/0.08)] rounded" />
          <div className="h-6 w-2/3 bg-[hsl(var(--primary)/0.08)] rounded" />
        </div>
      ) : !messages.length ? (
        <div className="text-sm text-muted-foreground" role="status">No messages yet.</div>
      ) : (
        <ul className="space-y-1">
          {messages.map((m, i) => (
            <li key={m.id}>
              <button
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="option"
                aria-selected={i === activeIndex}
                tabIndex={i === activeIndex ? 0 : -1}
                onClick={() => onSelect?.(m.id)}
                className="w-full text-left rounded border px-3 py-2 hover:bg-[hsl(var(--primary)/0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium text-sm">{m.subject || "(no subject)"}</div>
                  <div className="text-xs text-muted-foreground ml-2 shrink-0">{m.date}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.from}</div>
                <div className="text-xs truncate">{m.intro}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
