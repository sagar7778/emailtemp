import { NextRequest, NextResponse } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";

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
    let mailbox;
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mailboxParam = url.searchParams.get("mailbox");
      if (!mailboxParam) throw new Error("Missing mailbox param");
      mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    } else {
      const body = await req.json();
      mailbox = MailboxSchema.parse(body.mailbox);
    }
    const provider = pickProvider(mailbox.provider);
    const messages = await provider.getMessages(mailbox);
    return NextResponse.json(messages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch messages." }, { status: 400 });
  }
}
