import { NextRequest } from "next/server";
import { pickProvider } from "@/lib/providers";
import { z } from "zod";
import { shouldThrottle, jsonOk, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const BodySchema = z.object({
  provider: z.string().optional(),
  type: z.enum(["random", "custom"]),
  local: z.string().optional(),
  domain: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const body = await req.json();
    const { provider, type, local, domain } = BodySchema.parse(body);
    const prov = pickProvider(provider as any);
    
    let mailbox: any;
    if (type === "random") {
      // For random, pass empty string as local and domain if provided
      mailbox = await prov.createMailbox("", domain || "");
    } else {
      // For custom, both local and domain are required
      if (!local || !domain) throw new Error("Missing local or domain for custom mailbox");
      mailbox = await prov.createMailbox(local, domain);
    }
    
    // Scrub sensitive fields
    const safe: any = { 
      id: mailbox.id, 
      address: mailbox.address, 
      createdAt: mailbox.createdAt, 
      provider: mailbox.provider 
    };
    if (mailbox.meta?.id) safe.meta = { id: mailbox.meta.id };
    
    return jsonOk(safe);
  } catch (e) {
    return jsonError(e);
  }
}
