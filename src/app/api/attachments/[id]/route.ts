import { NextRequest } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";
import { shouldThrottle, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.string() });
const MailboxSchema = z.object({
  id: z.string(),
  address: z.string(),
  provider: z.string(),
  createdAt: z.string(),
  meta: z.any().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const url = new URL(req.url);
    const mailboxParam = url.searchParams.get("mailbox");
    const filename = url.searchParams.get("filename") || "attachment";
    if (!mailboxParam) throw new Error("Missing mailbox param");
    const mailbox = MailboxSchema.parse(JSON.parse(mailboxParam));
    const resolvedParams = await params;
    const { id } = ParamsSchema.parse(resolvedParams);
    const provider = pickProvider(mailbox.provider as any);
    const stream = await (provider as any).getAttachmentStream(mailbox as any, id, filename);
    return new Response(stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
