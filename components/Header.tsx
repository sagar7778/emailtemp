"use client";
import React from "react";

export default function Header() {
  const [provider, setProvider] = React.useState<string>("");
  const [providers, setProviders] = React.useState<{ id: string; label: string }[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/providers");
        if (!res.ok) return;
        const data = await res.json();
        const list: { id: string; label: string }[] = (data.providers || []).map((p: any) => ({ id: p.id, label: p.label }));
        setProviders(list);
        if (!provider && list[0]) setProvider(list[0].id);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b bg-white dark:bg-black">
      <span className="font-bold text-lg tracking-tight">Temp Mail</span>
      <div className="flex items-center gap-2">
        <label htmlFor="provider" className="text-xs text-muted-foreground">Provider</label>
        <select
          id="provider"
          className="h-8 rounded-md border px-2 text-sm bg-transparent"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
