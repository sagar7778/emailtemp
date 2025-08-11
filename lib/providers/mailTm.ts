import axios from "axios";
import { z } from "zod";
import type { Mailbox, MessageSummary, MessageDetail, ProviderId } from "./types";

const API = "https://api.mail.tm";
const TIMEOUT = 8000;

// Zod schemas for validation
const DomainSchema = z.object({ id: z.string(), domain: z.string() });
const DomainsSchema = z.object({ hydra: z.any(), "hydra:member": z.array(DomainSchema) });
const AccountSchema = z.object({ id: z.string(), address: z.string(), password: z.string() });
const TokenSchema = z.object({ token: z.string(), expires_at: z.string() });
const MessageListSchema = z.object({ "hydra:member": z.array(z.any()) });
const MessageSchema = z.object({
  id: z.string(),
  from: z.object({ address: z.string() }),
  subject: z.string(),
  intro: z.string().optional(),
  seen: z.boolean(),
  createdAt: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(z.object({ id: z.string(), filename: z.string(), size: z.number() })).optional(),
});

export interface MailTmMailbox extends Mailbox {
  meta: {
    id: string;
    password: string;
    token: string;
    tokenExpires: string;
  };
}

async function getToken(address: string, password: string): Promise<{ token: string; expires_at: string }> {
  const { data } = await axios.post(`${API}/token`, { address, password }, { timeout: TIMEOUT });
  return TokenSchema.parse(data);
}

export async function getDomains(): Promise<string[]> {
  const { data } = await axios.get(`${API}/domains`, { timeout: TIMEOUT });
  const parsed = DomainsSchema.parse(data);
  return parsed["hydra:member"].map((d) => d.domain);
}

export async function createAccount(domain: string): Promise<MailTmMailbox> {
  // Generate random local and password
  const local = Math.random().toString(36).slice(2, 10);
  const password = Math.random().toString(36).slice(2, 12);
  const address = `${local}@${domain}`;
  // Create account
  const { data } = await axios.post(`${API}/accounts`, { address, password }, { timeout: TIMEOUT });
  const account = AccountSchema.parse(data);
  // Get token
  const { token, expires_at } = await getToken(address, password);
  return {
    id: account.id,
    address,
    createdAt: new Date().toISOString(),
    provider: "mailTm" as ProviderId,
    meta: { id: account.id, password, token, tokenExpires: expires_at },
  };
}

export async function loginOrRefresh(mailbox: MailTmMailbox): Promise<MailTmMailbox> {
  // If token expired, re-login
  if (new Date(mailbox.meta.tokenExpires).getTime() < Date.now() + 60 * 1000) {
    const { token, expires_at } = await getToken(mailbox.address, mailbox.meta.password);
    return { ...mailbox, meta: { ...mailbox.meta, token, tokenExpires: expires_at } };
  }
  return mailbox;
}

export async function listMessages(mailbox: MailTmMailbox): Promise<MessageSummary[]> {
  mailbox = await loginOrRefresh(mailbox);
  const { data } = await axios.get(`${API}/messages`, {
    headers: { Authorization: `Bearer ${mailbox.meta.token}` },
    timeout: TIMEOUT,
  });
  const parsed = MessageListSchema.parse(data);
  return parsed["hydra:member"].map((msg: any) => ({
    id: msg.id,
    from: msg.from?.address || "",
    subject: msg.subject,
    intro: msg.intro || "",
    date: msg.createdAt,
    unread: !msg.seen,
  }));
}

export async function getMessage(mailbox: MailTmMailbox, id: string): Promise<MessageDetail> {
  mailbox = await loginOrRefresh(mailbox);
  const { data } = await axios.get(`${API}/messages/${id}`, {
    headers: { Authorization: `Bearer ${mailbox.meta.token}` },
    timeout: TIMEOUT,
  });
  const msg = MessageSchema.parse(data);
  return {
    id: msg.id,
    from: msg.from.address,
    subject: msg.subject,
    intro: msg.intro || msg.text?.slice(0, 80) || "",
    date: msg.createdAt,
    unread: !msg.seen,
    html: msg.html,
    text: msg.text,
    attachments: (msg.attachments || []).map((a) => ({
      filename: a.filename,
      url: `${API}/attachments/${a.id}/download`,
      size: a.size,
    })),
  };
}

export async function downloadAttachment(mailbox: MailTmMailbox, attachmentId: string): Promise<Blob> {
  mailbox = await loginOrRefresh(mailbox);
  const { data } = await axios.get(`${API}/attachments/${attachmentId}/download`, {
    headers: { Authorization: `Bearer ${mailbox.meta.token}` },
    responseType: "blob",
    timeout: TIMEOUT,
  });
  return data;
}

/**
 * Token lifecycle example:
 *
 * // On account creation:
 * const mailbox = await createAccount('mail.tm');
 * // mailbox.meta.token is stored server-side
 *
 * // On session route:
 * // Only expose: { id, address, provider, createdAt, meta: { id } }
 *
 * // On message fetch:
 * // mailbox.meta.password/token used to re-auth if needed
 */
