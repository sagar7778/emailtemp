import * as React from "react";
import { cn } from "./utils";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: { label: string; id: string; content: React.ReactNode }[];
  defaultTabId?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, className, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTabId || tabs[0]?.id);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex(tab => tab.id === activeTab);
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % tabs.length;
      setActiveTab(tabs[next].id);
      tabRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prev].id);
      tabRefs.current[prev]?.focus();
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div role="tablist" aria-orientation="horizontal" className="flex gap-2 border-b" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none",
              activeTab === tab.id ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-muted-foreground"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
