'use client';

import { Button, Input, Select, Tabs, Skeleton } from "../../components/ui";
import EmailAddressCard from "../../components/EmailAddressCard";
import InboxList from "../../components/InboxList";
import { useState, useEffect, useCallback } from "react";
import { useInboxPolling } from "@/hooks/useInboxPolling";
import type { Mailbox, MessageDetail, MessageSummary } from "@/lib/providers/types";
import { getSession, saveSession, removeSession } from "@/lib/storage";

export default function HomePage() {
  // Provider/domain inputs for hero
  const [providers, setProviders] = useState<{ id: string; label: string; domains: string[] }[]>([]);
  const [provider, setProvider] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [local, setLocal] = useState("");

  // Mailbox/session
  const [mailbox, setMailbox] = useState<(Mailbox & { meta?: any }) | null>(null);

  // Messages
  const { messages, loading, error, refresh } = useInboxPolling(mailbox, 8000);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  // Load session
  useEffect(() => {
    const saved = getSession<Mailbox & { meta?: any }>("mailbox");
    if (saved) setMailbox(saved);
  }, []);

  // Fetch providers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/providers");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProviders(data.providers || []);
        const first = data.providers?.[0];
        if (first) {
          setProvider(first.id);
          setDomains(first.domains || []);
          setDomain(first.domains?.[0] || "");
        }
      } catch {
        // silently ignore; UI remains usable
      }
    })();
  }, []);

  useEffect(() => {
    const p = providers.find((x) => x.id === provider);
    setDomains(p?.domains || []);
    if (p?.domains?.length && !domain) setDomain(p.domains[0]);
  }, [provider, providers]);

  // Create mailbox
  const createMailbox = useCallback(async (type: 'random' | 'custom', override?: { local?: string; domain?: string; provider?: string }) => {
    try {
      const body: any = { type };
      const useProvider = override?.provider || provider;
      const useDomain = override?.domain || domain;
      if (useProvider) body.provider = useProvider;
      if (type === 'custom') {
        body.local = override?.local ?? local;
        body.domain = useDomain;
      } else if (useDomain) {
        body.domain = useDomain;
      }
      const res = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const mb = (await res.json()) as Mailbox & { meta?: any };
      setMailbox(mb);
      saveSession('mailbox', mb);
      setToast({ open: true, message: 'Mailbox ready' });
      setTimeout(() => setToast({ open: false, message: '' }), 2000);
    } catch {
      setToast({ open: true, message: 'Something went wrong' });
      setTimeout(() => setToast({ open: false, message: '' }), 2000);
    }
  }, [provider, domain, local]);

  const onDelete = useCallback(() => {
    removeSession('mailbox');
    setMailbox(null);
    setSelected(null);
    setSelectedIndex(0);
    setToast({ open: true, message: 'Mailbox deleted' });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  }, []);

  // Open message detail
  const openMessageByIndex = useCallback(async (index: number) => {
    if (!messages.length || !mailbox) return;
    const i = Math.max(0, Math.min(messages.length - 1, index));
    const msg = messages[i];
    try {
      const qs = new URLSearchParams({ mailbox: JSON.stringify({ id: mailbox.id, address: mailbox.address, provider: mailbox.provider, createdAt: mailbox.createdAt, meta: mailbox.meta ? { id: mailbox.meta.id } : undefined }) });
      const res = await fetch(`/api/messages/${encodeURIComponent(msg.id)}?${qs.toString()}`);
      if (!res.ok) throw new Error();
      const detail = (await res.json()) as MessageDetail;
      setSelected(detail);
      setSelectedIndex(i);
    } catch {
      setToast({ open: true, message: 'Unable to open message' });
      setTimeout(() => setToast({ open: false, message: '' }), 1500);
    }
  }, [messages, mailbox]);

  const onSelectMessage = useCallback((id: string) => {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx >= 0) void openMessageByIndex(idx);
  }, [messages, openMessageByIndex]);

  // Keyboard shortcuts: R refresh, J/K navigate, Enter open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        refresh();
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (messages.length) void openMessageByIndex(Math.min(messages.length - 1, selectedIndex + 1));
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (messages.length) void openMessageByIndex(Math.max(0, selectedIndex - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (messages.length) void openMessageByIndex(selectedIndex);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [refresh, openMessageByIndex, messages.length, selectedIndex]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-2 sm:px-0 py-8 gap-8">
      {/* Hero Section */}
      <section className="w-full max-w-xl rounded-xl p-6 sm:p-10 bg-gradient-to-br from-[hsl(var(--gradient-primary))] to-[hsl(var(--primary-glow))] shadow-glow flex flex-col items-center gap-6 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))]">Free Disposable Email</h1>
        <p className="text-base sm:text-lg text-white/90 max-w-md mx-auto">Protect your privacy and avoid spam with a temporary email address. No registration, instant inbox.</p>
        <form className="w-full flex flex-col sm:flex-row gap-3 items-stretch justify-center" aria-label="Create disposable email" onSubmit={(e) => { e.preventDefault(); void createMailbox('custom'); }}>
          <Input
            className="flex-1 min-w-0"
            placeholder="custom.localpart"
            value={local}
            onChange={e => setLocal(e.target.value)}
            aria-label="Local part"
            autoFocus
          />
          <Select className="w-32" aria-label="Domain picker" value={domain} onChange={(e: any) => setDomain(e.target.value)}>
            {domains.map((d) => (
              <option key={d} value={d}>@{d}</option>
            ))}
          </Select>
          <Select className="w-32" aria-label="Provider selector" value={provider} onChange={(e: any) => setProvider(e.target.value)}>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </Select>
        </form>
        <div className="flex gap-2 w-full justify-center">
          <Button variant="hero" className="flex-1 sm:flex-none" tabIndex={0} aria-label="Generate random email" onClick={() => void createMailbox('random')}>Generate Random</Button>
          <Button variant="hero" className="flex-1 sm:flex-none" tabIndex={0} aria-label="Create custom email" onClick={() => void createMailbox('custom')}>Create</Button>
        </div>
        <div className="absolute right-4 top-4 hidden sm:block text-xs text-white/70 select-none">R refresh · J/K navigate · Enter open</div>
      </section>

      {/* Email Address Card */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-2">
        <EmailAddressCard
          mailbox={mailbox}
          onCreate={({ type, local: l, domain: d, provider: p }) => void createMailbox(type, { local: l, domain: d, provider: p })}
          onRefresh={() => refresh()}
          onDelete={onDelete}
        />
      </section>

      {/* Tabs: Inbox | About */}
      <section className="w-full max-w-5xl mt-2">
        <Tabs
          tabs={[
            {
              label: "Inbox",
              id: "inbox",
              content: (
                <div className="flex flex-col md:flex-row gap-6 mt-2">
                  <div className="flex-1 min-w-[280px]">
                    <InboxList messages={messages} loading={loading} onSelect={onSelectMessage} onRefresh={refresh} />
                  </div>
                  <div className="flex-1 min-w-[280px]">
                    {!selected ? (
                      <div className="space-y-2">
                        {loading ? (
                          <>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-40 w-full" />
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">Select a message</div>
                        )}
                      </div>
                    ) : (
                      <article className="w-full space-y-3">
                        <header>
                          <h2 className="text-lg font-semibold break-words">{selected.subject || "(no subject)"}</h2>
                          <div className="text-xs text-muted-foreground">From: {selected.from} • {new Date(selected.date).toLocaleString()}</div>
                        </header>
                        {selected.html ? (
                          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.html }} />
                        ) : (
                          <pre className="whitespace-pre-wrap text-sm">{selected.text || "(no content)"}</pre>
                        )}
                        {selected.attachments?.length ? (
                          <section>
                            <h3 className="text-sm font-medium mb-2">Attachments</h3>
                            <ul className="space-y-1">
                              {selected.attachments.map((a, idx) => (
                                <li key={idx}>
                                  <a
                                    href={`${a.url}?mailbox=${encodeURIComponent(JSON.stringify({ id: mailbox?.id, address: mailbox?.address, provider: mailbox?.provider, createdAt: mailbox?.createdAt, meta: mailbox?.meta ? { id: mailbox.meta.id } : undefined }))}`}
                                    className="text-sm underline"
                                  >
                                    {a.filename} ({Math.round(a.size / 1024)} KB)
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                      </article>
                    )}
                  </div>
                </div>
              ),
            },
            {
              label: "About",
              id: "about",
              content: (
                <div className="prose prose-sm max-w-none mt-2 text-muted-foreground">
                  <h2>About Temp Mail</h2>
                  <p>Temp Mail lets you create a disposable email address for free. Use it to sign up for services, receive verification codes, and keep your real inbox safe from spam.</p>
                  <ul>
                    <li>No registration required</li>
                    <li>Instant inbox, auto-refresh</li>
                    <li>Multiple domains and providers (coming soon)</li>
                  </ul>
                </div>
              ),
            },
          ]}
          defaultTabId="inbox"
        />
      </section>

      {/* Lightweight toast */}
      {toast.open && (
        <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-[hsl(var(--primary))] text-white px-3 py-2 shadow-glow text-sm">
          {toast.message}
        </div>
      )}

      {/* Keyboard hint for mobile */}
      <div className="sm:hidden text-xs text-muted-foreground mt-4">R refresh · J/K navigate · Enter open</div>
      </main>
  );
}
