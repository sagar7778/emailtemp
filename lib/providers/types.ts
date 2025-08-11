export type ProviderId = 'oneSec' | 'mailTm' | 'tempMailPaid';

export interface Mailbox {
  id: string;
  address: string;
  createdAt: string;
  provider: ProviderId;
}

export interface MessageSummary {
  id: string;
  from: string;
  subject: string;
  intro: string;
  date: string;
  unread: boolean;
}

export interface MessageDetail extends MessageSummary {
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

export interface TempMailProvider {
  id: ProviderId;
  label: string;
  domains: string[];
  getMailboxes(): Promise<Mailbox[]>;
  createMailbox(local: string, domain: string): Promise<Mailbox>;
  getMessages(mailbox: Mailbox): Promise<MessageSummary[]>;
  getMessageDetail(mailbox: Mailbox, messageId: string): Promise<MessageDetail>;
  deleteMailbox(mailbox: Mailbox): Promise<void>;
}
