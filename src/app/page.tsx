'use client';

import { Button, Input, Select, Tabs, Skeleton } from "../../components/ui";
import EmailAddressCard from "../../components/EmailAddressCard";
import InboxList from "../../components/InboxList";
import MessageViewer from "../../components/MessageViewer";
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
  }, [provider, providers, domain]);

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
      setToast({ open: true, message: '✨ Mailbox created successfully!' });
      setTimeout(() => setToast({ open: false, message: '' }), 3000);
    } catch {
      setToast({ open: true, message: '❌ Failed to create mailbox' });
      setTimeout(() => setToast({ open: false, message: '' }), 3000);
    }
  }, [provider, domain, local]);

  const onDelete = useCallback(() => {
    removeSession('mailbox');
    setMailbox(null);
    setSelected(null);
    setSelectedIndex(0);
    setToast({ open: true, message: '🗑️ Mailbox deleted' });
    setTimeout(() => setToast({ open: false, message: '' }), 2000);
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
      setToast({ open: true, message: '❌ Unable to open message' });
      setTimeout(() => setToast({ open: false, message: '' }), 2000);
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
        setToast({ open: true, message: '🔄 Refreshing inbox...' });
        setTimeout(() => setToast({ open: false, message: '' }), 1500);
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Hero Section */}
        <section className="w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-700/20 animate-pulse" />
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
            
            <div className="relative p-8 sm:p-12 lg:p-16 flex flex-col items-center gap-8 text-center">
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100 leading-tight">
                  Free Disposable Email
                </h1>
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Protect your privacy and avoid spam with a temporary email address. 
                  <br className="hidden sm:block" />
                  No registration, instant inbox, complete anonymity.
                </p>
              </div>

              {/* Email Creation Form */}
              <div className="w-full max-w-2xl space-y-6">
                <form 
                  className="flex flex-col sm:flex-row gap-4 items-stretch justify-center" 
                  aria-label="Create disposable email" 
                  onSubmit={(e) => { e.preventDefault(); void createMailbox('custom'); }}
                >
                  <Input
                    className="flex-1 min-w-0 bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm"
                    placeholder="Enter custom name"
                    value={local}
                    onChange={e => setLocal(e.target.value)}
                    aria-label="Local part"
                    autoFocus
                  />
                  <Select 
                    className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm" 
                    aria-label="Domain picker" 
                    value={domain} 
                    onChange={(e: any) => setDomain(e.target.value)}
                  >
                    {domains.map((d) => (
                      <option key={d} value={d} className="bg-slate-800 text-white">@{d}</option>
                    ))}
                  </Select>
                  <Select 
                    className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm" 
                    aria-label="Provider selector" 
                    value={provider} 
                    onChange={(e: any) => setProvider(e.target.value)}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.label}</option>
                    ))}
                  </Select>
                </form>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Button 
                    variant="hero" 
                    className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-lg font-semibold py-4 px-8 transition-all duration-300 hover:scale-105" 
                    tabIndex={0} 
                    aria-label="Generate random email" 
                    onClick={() => void createMailbox('random')}
                  >
                    🎲 Generate Random
                  </Button>
                  <Button 
                    variant="hero" 
                    className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-lg font-semibold py-4 px-8 transition-all duration-300 hover:scale-105" 
                    tabIndex={0} 
                    aria-label="Create custom email" 
                    onClick={() => void createMailbox('custom')}
                  >
                    ✨ Create Custom
                  </Button>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="absolute top-4 right-4 hidden lg:block text-sm text-white/70 select-none bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                ⌨️ R refresh · J/K navigate · Enter open
              </div>
            </div>
          </div>
        </section>

        {/* Email Address Card */}
        {mailbox && (
          <section className="w-full max-w-4xl animate-in slide-in-from-top-4 duration-500">
            <EmailAddressCard
              mailbox={mailbox}
              onCreate={({ type, local: l, domain: d, provider: p }) => void createMailbox(type, { local: l, domain: d, provider: p })}
              onRefresh={() => refresh()}
              onDelete={onDelete}
            />
          </section>
        )}

        {/* Main Content Area */}
        <section className="w-full max-w-7xl">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <Tabs
              tabs={[
                {
                  label: "📧 Inbox",
                  id: "inbox",
                  content: (
                    <div className="flex flex-col lg:flex-row gap-0 min-h-[600px]">
                      {/* Inbox List */}
                      <div className="flex-1 min-w-[320px] border-r border-slate-200 dark:border-slate-700">
                        <div className="p-6">
                          <InboxList 
                            messages={messages} 
                            loading={loading} 
                            onSelect={onSelectMessage} 
                            onRefresh={refresh} 
                          />
                        </div>
                      </div>
                      
                      {/* Message Viewer */}
                      <div className="flex-1 min-w-[320px]">
                        <div className="p-6 h-full">
                          {!selected ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                              {loading ? (
                                <div className="space-y-4 w-full">
                                  <Skeleton className="h-8 w-3/4 mx-auto" />
                                  <Skeleton className="h-32 w-full" />
                                  <Skeleton className="h-24 w-full" />
                                </div>
                              ) : (
                                <>
                                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">📧</span>
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                      No message selected
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Choose a message from the inbox to view its content
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <MessageViewer 
                              message={selected} 
                              mailbox={mailbox} 
                              onClose={() => setSelected(null)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: "ℹ️ About",
                  id: "about",
                  content: (
                    <div className="p-8">
                      <div className="max-w-3xl mx-auto space-y-6">
                        <div className="text-center space-y-4">
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            About Temp Mail
                          </h2>
                          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            Temp Mail lets you create a disposable email address for free. Use it to sign up for services, 
                            receive verification codes, and keep your real inbox safe from spam.
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="text-3xl mb-3">🚀</div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instant Setup</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">No registration required. Create an email address in seconds.</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="text-3xl mb-3">🔒</div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Privacy First</h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Keep your real email private and avoid spam forever.</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="text-3xl mb-3">⚡</div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Auto Refresh</h3>
                            <p className="text-sm text-green-700 dark:text-green-300">Real-time inbox updates with automatic message polling.</p>
                          </div>
                        </div>
                        
                        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Features</h3>
                          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              Multiple email providers (1secmail, Mail.tm)
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              Custom and random email generation
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              HTML email support with sanitization
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              Attachment downloads
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              QR code generation for easy sharing
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              Full keyboard navigation support
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
              defaultTabId="inbox"
            />
          </div>
        </section>

        {/* Enhanced Toast */}
        {toast.open && (
          <div 
            role="status" 
            aria-live="polite" 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl backdrop-blur-sm border border-white/20 dark:border-slate-800/50 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Mobile keyboard hint */}
        <div className="lg:hidden text-sm text-slate-500 dark:text-slate-400 mt-4 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
          ⌨️ R refresh · J/K navigate · Enter open
        </div>
      </div>
    </main>
  );
}
