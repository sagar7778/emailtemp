import { NextRequest } from "next/server";
import { pickProvider } from "@/lib/providers";
import { sanitizeEmailHtml } from "@/lib/sanitize";
import { z } from "zod";
import { shouldThrottle, jsonOk, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.string() });
const MailboxSchema = z.object({
  id: z.string(),
  address: z.string(),
  provider: z.string(),
  createdAt: z.string(),
  meta: z.any().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const url = new URL(req.url);
    const mailboxParam = url.searchParams.get("mailbox");
    if (!mailboxParam) throw new Error("Missing mailbox param");
    const mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    const { id } = ParamsSchema.parse(params);
    const provider = pickProvider(mailbox.provider as any);
    const detail = await provider.getMessageDetail(mailbox as any, id);
    if (detail.html) {
      detail.html = sanitizeEmailHtml(detail.html);
    }
    return jsonOk(detail);
  } catch (e) {
    return jsonError(e);
  }
}
