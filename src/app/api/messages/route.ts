import { NextRequest } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";
import { shouldThrottle, jsonOk, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const MailboxSchema = z.object({
  id: z.string(),
  address: z.string(),
  provider: z.string(),
  createdAt: z.string(),
  meta: z.any().optional(),
});

export async function GET(req: NextRequest) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const url = new URL(req.url);
    const mailboxParam = url.searchParams.get("mailbox");
    if (!mailboxParam) throw new Error("Missing mailbox param");
    const mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    const provider = pickProvider(mailbox.provider as any);
    const messages = await provider.getMessages(mailbox as any);
    return jsonOk(messages);
  } catch (e) {
    return jsonError(e);
  }
}
