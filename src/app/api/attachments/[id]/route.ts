import { NextRequest } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";

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
    const url = new URL(req.url);
    const mailboxParam = url.searchParams.get("mailbox");
    const filename = url.searchParams.get("filename") || "attachment";
    if (!mailboxParam) throw new Error("Missing mailbox param");
    const mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    const { id } = ParamsSchema.parse(params);
    const provider = pickProvider(mailbox.provider);
    const stream = await provider.getAttachmentStream(mailbox, id, filename);
    return new Response(stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Failed to fetch attachment." }), { status: 400 });
  }
}
