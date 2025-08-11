'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Mailbox, MessageSummary } from '@/lib/providers/types';

export interface UseInboxPollingResult {
  messages: MessageSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function serializeSafeMailbox(mailbox: Partial<Mailbox & { meta?: any }>): any {
  if (!mailbox) return null;
  const safe: any = {
    id: mailbox.id,
    address: mailbox.address,
    provider: mailbox.provider,
    createdAt: mailbox.createdAt,
  };
  if (mailbox.meta && typeof mailbox.meta === 'object' && 'id' in mailbox.meta) {
    safe.meta = { id: mailbox.meta.id };
  }
  return safe;
}

export function useInboxPolling(
  mailbox: Partial<Mailbox & { meta?: any }> | null,
  intervalMs: number = 8000
): UseInboxPollingResult {
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const safeMailbox = useMemo(() => serializeSafeMailbox(mailbox || {}), [mailbox?.id, mailbox?.address, mailbox?.provider, mailbox?.createdAt]);

  const fetchMessages = useCallback(async () => {
    if (!safeMailbox?.id || !safeMailbox?.address || !safeMailbox?.provider) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ mailbox: JSON.stringify(safeMailbox) }).toString();
      const res = await fetch(`/api/messages?${qs}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);
      const data = (await res.json()) as MessageSummary[];
      setMessages(data);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message ?? 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [safeMailbox]);

  // Public refresh
  const refresh = useCallback(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Polling interval (fallback)
  useEffect(() => {
    // Initial fetch
    void fetchMessages();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (intervalMs > 0) {
      // Use window.setInterval typing
      intervalRef.current = window.setInterval(() => {
        void fetchMessages();
      }, intervalMs) as unknown as number;
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [fetchMessages, intervalMs]);

  // Progressive enhancement: try SSE if available
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      esRef.current?.close();
      const es = new EventSource('/api/sse');
      esRef.current = es;
      es.addEventListener('tick', () => {
        void fetchMessages();
      });
      es.onerror = () => {
        // If SSE fails, close and rely on polling
        es.close();
      };
      return () => {
        es.close();
      };
    } catch {
      // Ignore; rely on polling
      return;
    }
  }, [fetchMessages]);

  // Abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      esRef.current?.close();
    };
  }, []);

  return { messages, loading, error, refresh };
}
