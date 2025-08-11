import type { ProviderId, TempMailProvider } from "./types";
import { tempMailPaidProvider } from "./tempMailPaid";

// Placeholder implementations (to be filled in)
export const providers: Record<ProviderId, TempMailProvider> = {
  oneSec: {
    id: "oneSec",
    label: "1secmail",
    domains: [],
    getMailboxes: async () => [],
    createMailbox: async () => { throw new Error("Not implemented"); },
    getMessages: async () => [],
    getMessageDetail: async () => { throw new Error("Not implemented"); },
    deleteMailbox: async () => { throw new Error("Not implemented"); },
  },
  mailTm: {
    id: "mailTm",
    label: "Mail.tm",
    domains: [],
    getMailboxes: async () => [],
    createMailbox: async () => { throw new Error("Not implemented"); },
    getMessages: async () => [],
    getMessageDetail: async () => { throw new Error("Not implemented"); },
    deleteMailbox: async () => { throw new Error("Not implemented"); },
  },
  tempMailPaid: tempMailPaidProvider,
};

export function getActiveProviders(): TempMailProvider[] {
  const active: TempMailProvider[] = [providers.oneSec, providers.mailTm];
  if (providers.tempMailPaid && (providers.tempMailPaid as any).isEnabled) {
    active.push(providers.tempMailPaid);
  }
  return active;
}

let rrIdx = 0;
export function pickProvider(preferred?: ProviderId): TempMailProvider {
  const active = getActiveProviders();
  if (preferred) {
    const found = active.find(p => p.id === preferred);
    if (found) return found;
  }
  // round-robin fallback
  const picked = active[rrIdx % active.length];
  rrIdx++;
  return picked;
}
