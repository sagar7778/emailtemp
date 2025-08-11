"use client";

import React from "react";
import type { Mailbox } from "@/lib/providers/types";
import { Toast } from "./ui/toast";
import Image from "next/image";

type ProvidersResponse = {
  providers: { id: string; label: string; domains: string[] }[];
  domainsByProvider: Record<string, string[]>;
};

export interface EmailAddressCardProps {
  mailbox: (Mailbox & { meta?: any }) | null;
  onCreate?: (next: { type: "random" | "custom"; local?: string; domain?: string; provider?: string }) => void;
  onRefresh?: () => void;
  onDelete?: () => void;
}

export default function EmailAddressCard({ mailbox, onCreate, onRefresh, onDelete }: EmailAddressCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);
  const [localPart, setLocalPart] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [provider, setProvider] = React.useState(mailbox?.provider ?? "");
  const [domainsByProvider, setDomainsByProvider] = React.useState<Record<string, string[]>>({});
  const address = mailbox?.address ?? "";

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/providers");
        if (!res.ok) return;
        const data = (await res.json()) as ProvidersResponse;
        setDomainsByProvider(data.domainsByProvider || {});
        if (!domain && mailbox?.address) {
          const dom = mailbox.address.split("@")[1];
          setDomain(dom);
        } else if (!domain) {
          const firstProvider = Object.keys(data.domainsByProvider)[0];
          const firstDomain = data.domainsByProvider[firstProvider]?.[0];
          if (firstDomain) setDomain(firstDomain);
        }
        if (!provider) {
          const firstProvider = Object.keys(data.domainsByProvider)[0];
          if (firstProvider) setProvider(firstProvider);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 2500);
    } catch {}
  };

  const handleCreateRandom = () => {
    onCreate?.({ type: "random", provider, domain });
  };

  const handleCreateCustom = () => {
    if (!localPart || !domain) return;
    onCreate?.({ type: "custom", local: localPart, domain, provider });
  };

  const qrSrc = address ? `/api/qr?text=${encodeURIComponent(address)}` : "";

  const providerDomains = provider ? domainsByProvider[provider] ?? [] : [];

  return (
    <div className="w-full bg-white dark:bg-black rounded-lg shadow-elev p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-[hsl(var(--primary))] truncate" aria-live="polite">{address || "—"}</span>
          {provider && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" aria-label="Provider badge">
              {provider}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            aria-label="Custom local part"
            className="h-9 w-40 rounded-md border px-2 text-sm bg-transparent"
            placeholder="custom.local"
            value={localPart}
            onChange={(e) => setLocalPart(e.target.value)}
          />
          <select
            aria-label="Select domain"
            className="h-9 rounded-md border px-2 text-sm bg-transparent"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {providerDomains.map((d) => (
              <option key={d} value={d}>@{d}</option>
            ))}
          </select>
          <select
            aria-label="Select provider"
            className="h-9 rounded-md border px-2 text-sm bg-transparent"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {Object.keys(domainsByProvider).map((pid) => (
              <option key={pid} value={pid}>{pid}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={handleCreateCustom} className="btn-hero text-sm" aria-label="Create custom email">Create</button>
          <button onClick={handleCreateRandom} className="text-sm rounded-md border px-3 py-2" aria-label="Generate random email">Random</button>
          <button onClick={onRefresh} className="text-sm rounded-md border px-3 py-2" aria-label="Refresh inbox">Refresh</button>
          <button onClick={onDelete} className="text-sm rounded-md border px-3 py-2" aria-label="Delete mailbox">Delete</button>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleCopy} className="rounded-md border px-3 py-2 text-sm" aria-label="Copy address">Copy</button>
        <button onClick={() => setShowQR(true)} className="rounded-md border px-3 py-2 text-sm" aria-label="Show QR">QR</button>
      </div>

      {/* Toast for copy feedback */}
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} message={copied ? "Copied" : ""} />

      {/* Dialog for QR */}
      {showQR && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowQR(false)}>
          <div className="rounded-lg bg-white dark:bg-black p-4 shadow-elev max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">QR Code</h2>
              <button onClick={() => setShowQR(false)} aria-label="Close" className="text-sm">✕</button>
            </div>
            {qrSrc ? (
              <Image 
                src={qrSrc} 
                alt={`QR code for ${address}`} 
                width={192} 
                height={192} 
                className="mx-auto h-48 w-48" 
                priority={false}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No address</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
