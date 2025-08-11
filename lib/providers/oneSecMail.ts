import axios from "axios";
import type { Mailbox, MessageSummary, MessageDetail } from "./types";

const API = "https://www.1secmail.com/api/v1/";
const TIMEOUT = 8000;

export interface OneSecMailMailbox extends Mailbox {
  local: string;
  domain: string;
}

export interface OneSecMailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
  attachments: Array<{ filename: string; contentType: string; size: number }>; // not used here
  seen: boolean;
  intro: string;
}

export async function getDomains(): Promise<string[]> {
  const { data } = await axios.get<string[]>(API, {
    params: { action: "getDomainList" },
    timeout: TIMEOUT,
  });
  return data;
}

export async function createRandomMailbox(domain?: string): Promise<OneSecMailMailbox> {
  const params: any = { action: "genRandomMailbox", count: 1 };
  if (domain) params.domain = domain;
  const { data } = await axios.get<string[]>(API, { params, timeout: TIMEOUT });
  const address = data[0];
  const [local, dom] = address.split("@");
  return {
    id: address,
    address,
    local,
    domain: dom,
    createdAt: new Date().toISOString(),
    provider: "oneSec",
  };
}

export async function createCustomMailbox(local: string, domain: string): Promise<OneSecMailMailbox> {
  const address = `${local}@${domain}`;
  return {
    id: address,
    address,
    local,
    domain,
    createdAt: new Date().toISOString(),
    provider: "oneSec",
  };
}

export async function listMessages(mailbox: OneSecMailMailbox): Promise<MessageSummary[]> {
  try {
    const { data } = await axios.get<OneSecMailMessage[]>(API, {
      params: { action: "getMessages", login: mailbox.local, domain: mailbox.domain },
      timeout: TIMEOUT,
    });
    return data.map(msg => ({
      id: String(msg.id),
      from: msg.from,
      subject: msg.subject,
      intro: msg.intro,
      date: msg.date,
      unread: !msg.seen,
    }));
  } catch (e) {
    return [];
  }
}

export async function getMessage(mailbox: OneSecMailMailbox, id: string): Promise<MessageDetail> {
  const { data } = await axios.get<any>(API, {
    params: { action: "readMessage", login: mailbox.local, domain: mailbox.domain, id },
    timeout: TIMEOUT,
  });
  return {
    id: String(data.id),
    from: data.from,
    subject: data.subject,
    intro: data.textBody?.slice(0, 80) || "",
    date: data.date,
    unread: false,
    html: data.htmlBody,
    text: data.textBody,
    attachments: (data.attachments || []).map((a: any) => ({
      filename: a.filename,
      url: `${API}?action=download&login=${mailbox.local}&domain=${mailbox.domain}&id=${id}&file=${a.filename}`,
      size: a.size,
    })),
  };
}

export async function getAttachmentStream(mailbox: OneSecMailMailbox, id: string, filename: string): Promise<Blob> {
  const url = `${API}?action=download&login=${mailbox.local}&domain=${mailbox.domain}&id=${id}&file=${filename}`;
  const { data } = await axios.get(url, { responseType: "blob", timeout: TIMEOUT });
  return data;
}

/**
 * Usage Example:
 *
 * // Create a random mailbox and list messages
 * const mailbox = await createRandomMailbox();
 * const messages = await listMessages(mailbox);
 * // mailbox.address => 'abc@1secmail.com'
 * // messages => [ { id, from, subject, ... }, ... ]
 */
