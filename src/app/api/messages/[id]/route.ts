import { NextRequest, NextResponse } from "next/server";
import { pickProvider } from "@/lib/providers";
import { sanitizeEmailHtml } from "@/lib/sanitize";
import { z } from "zod";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string(),
});
const MailboxSchema = z.object({
  id: z.string(),
  address: z.string(),
  provider: z.string(),
  createdAt: z.string(),
  meta: z.any().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const mailboxParam = url.searchParams.get("mailbox");
    if (!mailboxParam) throw new Error("Missing mailbox param");
    const mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    const { id } = ParamsSchema.parse(params);
    const provider = pickProvider(mailbox.provider);
    const detail = await provider.getMessageDetail(mailbox, id);
    if (detail.html) {
      detail.html = sanitizeEmailHtml(detail.html);
    }
    return NextResponse.json(detail);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch message." }, { status: 400 });
  }
}
