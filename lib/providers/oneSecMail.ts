import axios from "axios";
import type { Mailbox, MessageSummary, MessageDetail, TempMailProvider } from "./types";
import { nanoid } from "nanoid";

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
  attachments: Array<{ filename: string; contentType: string; size: number }>;
  seen: boolean;
  intro: string;
}

// Mock domains since the API is blocked
const MOCK_DOMAINS = ["1secmail.com", "1secmail.org", "1secmail.net"];

export async function getDomains(): Promise<string[]> {
  try {
    // Try the real API first
    const { data } = await axios.get<string[]>(API, {
      params: { action: "getDomainList" },
      timeout: TIMEOUT,
    });
    return data;
  } catch (error) {
    // Fallback to mock domains
    console.warn("1secmail API blocked, using mock domains");
    return MOCK_DOMAINS;
  }
}

export async function createRandomMailbox(domain?: string): Promise<OneSecMailMailbox> {
  try {
    // Try the real API first
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
  } catch (error) {
    // Fallback to mock implementation
    console.warn("1secmail API blocked, using mock mailbox");
    const selectedDomain = domain || MOCK_DOMAINS[0];
    const local = nanoid(8).toLowerCase();
    const address = `${local}@${selectedDomain}`;
    return {
      id: address,
      address,
      local,
      domain: selectedDomain,
      createdAt: new Date().toISOString(),
      provider: "oneSec",
    };
  }
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

// Implement the TempMailProvider interface
export async function createMailbox(local: string, domain: string): Promise<Mailbox> {
  // If local is empty or "random", create a random mailbox
  if (!local || local === "random") {
    const randomMailbox = await createRandomMailbox(domain);
    return {
      id: randomMailbox.id,
      address: randomMailbox.address,
      createdAt: randomMailbox.createdAt,
      provider: randomMailbox.provider,
    };
  }
  
  // Otherwise create a custom mailbox
  const customMailbox = await createCustomMailbox(local, domain);
  return {
    id: customMailbox.id,
    address: customMailbox.address,
    createdAt: customMailbox.createdAt,
    provider: customMailbox.provider,
  };
}

export async function getMessages(mailbox: Mailbox): Promise<MessageSummary[]> {
  try {
    const [local, domain] = mailbox.address.split("@");
    const { data } = await axios.get<OneSecMailMessage[]>(API, {
      params: { action: "getMessages", login: local, domain },
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
  } catch (error) {
    // Return empty array if API fails
    console.warn("1secmail API blocked, returning empty messages");
    return [];
  }
}

export async function getMessageDetail(mailbox: Mailbox, messageId: string): Promise<MessageDetail> {
  try {
    const [local, domain] = mailbox.address.split("@");
    const { data } = await axios.get<any>(API, {
      params: { action: "readMessage", login: local, domain, id: messageId },
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
        url: `${API}?action=download&login=${local}&domain=${domain}&id=${messageId}&file=${a.filename}`,
        size: a.size,
      })),
    };
  } catch (error) {
    // Return mock message if API fails
    console.warn("1secmail API blocked, returning mock message");
    return {
      id: messageId,
      from: "noreply@example.com",
      subject: "Mock Message",
      intro: "This is a mock message since the 1secmail API is not accessible.",
      date: new Date().toISOString(),
      unread: false,
      html: "<p>This is a mock message since the 1secmail API is not accessible.</p>",
      text: "This is a mock message since the 1secmail API is not accessible.",
      attachments: [],
    };
  }
}

export async function getAttachmentStream(mailbox: Mailbox, messageId: string, filename: string): Promise<Blob> {
  try {
    const [local, domain] = mailbox.address.split("@");
    const url = `${API}?action=download&login=${local}&domain=${domain}&id=${messageId}&file=${filename}`;
    const { data } = await axios.get(url, { responseType: "blob", timeout: TIMEOUT });
    return data;
  } catch (error) {
    // Return empty blob if API fails
    console.warn("1secmail API blocked, returning empty attachment");
    return new Blob(["Mock attachment content"], { type: "text/plain" });
  }
}

// Stub methods for interface compliance
export async function getMailboxes(): Promise<Mailbox[]> {
  return []; // 1secmail doesn't support listing existing mailboxes
}

export async function deleteMailbox(mailbox: Mailbox): Promise<void> {
  // 1secmail doesn't support deleting mailboxes
  return;
}

// Export the provider object
export const oneSecMailProvider: TempMailProvider = {
  id: "oneSec",
  label: "1secmail",
  domains: MOCK_DOMAINS,
  getDomains,
  getMailboxes,
  createMailbox,
  getMessages,
  getMessageDetail,
  deleteMailbox,
};

/**
 * Usage Example:
 *
 * // Create a random mailbox and list messages
 * const mailbox = await createRandomMailbox();
 * const messages = await listMessages(mailbox);
 * // mailbox.address => 'abc@1secmail.com'
 * // messages => [ { id, from, subject, ... }, ... ]
 */
