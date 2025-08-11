import { NextRequest, NextResponse } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  provider: z.string().optional(),
  type: z.enum(["random", "custom"]),
  local: z.string().optional(),
  domain: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, type, local, domain } = BodySchema.parse(body);
    const prov = pickProvider(provider);
    let mailbox;
    if (type === "random") {
      mailbox = await prov.createMailbox
        ? await prov.createMailbox(local || "", domain || "")
        : await (prov.createRandomMailbox?.(domain) ?? Promise.reject("Not implemented"));
    } else {
      if (!local || !domain) throw new Error("Missing local or domain for custom mailbox");
      mailbox = await prov.createMailbox(local, domain);
    }
    // Remove sensitive fields
    const { meta, password, ...safeMailbox } = mailbox;
    if (meta && typeof meta === "object") {
      // Only expose meta.id if present
      safeMailbox.meta = { id: meta.id };
    }
    return NextResponse.json(safeMailbox);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create mailbox." }, { status: 400 });
  }
}
