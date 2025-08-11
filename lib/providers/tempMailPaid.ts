import type { TempMailProvider, ProviderId, Mailbox, MessageSummary, MessageDetail } from "./types";

export interface TempMailPaidProvider extends TempMailProvider {
  isEnabled: boolean;
}

const key = typeof process !== 'undefined' ? process.env.TEMPMAIL_API_KEY : undefined;

function disabled(): never {
  throw new Error("TempMail Paid provider is not enabled (missing API key)");
}

const disabledProvider: TempMailPaidProvider = {
  id: "tempMailPaid",
  label: "TempMail Paid",
  domains: [],
  isEnabled: false,
  getMailboxes: async () => disabled(),
  createMailbox: async () => disabled(),
  getMessages: async () => disabled(),
  getMessageDetail: async () => disabled(),
  deleteMailbox: async () => disabled(),
};

const enabledProvider: TempMailPaidProvider = {
  id: "tempMailPaid",
  label: "TempMail Paid",
  domains: [], // To be fetched from API
  isEnabled: true,
  async getMailboxes() {
    // TODO: Implement paid API call
    return [];
  },
  async createMailbox(local: string, domain: string) {
    // TODO: Implement paid API call
    throw new Error("Not implemented");
  },
  async getMessages(mailbox: Mailbox) {
    // TODO: Implement paid API call
    return [];
  },
  async getMessageDetail(mailbox: Mailbox, messageId: string) {
    // TODO: Implement paid API call
    throw new Error("Not implemented");
  },
  async deleteMailbox(mailbox: Mailbox) {
    // TODO: Implement paid API call
    throw new Error("Not implemented");
  },
};

export const tempMailPaidProvider: TempMailPaidProvider = key ? enabledProvider : disabledProvider;
