import { NextRequest } from "next/server";
import { getActiveProviders } from "@/lib/providers";
import { z } from "zod";
import { shouldThrottle, jsonOk, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const ProviderSchema = z.object({
  id: z.string(),
  label: z.string(),
  domains: z.array(z.string()),
});

export async function GET(req: NextRequest) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const providers = getActiveProviders();
    const providersList = await Promise.all(
      providers.map(async (p) => {
        let domains: string[] = [];
        try {
          if (typeof p.getDomains === "function") {
            domains = await p.getDomains();
          } else if (Array.isArray(p.domains)) {
            domains = p.domains;
          }
        } catch {
          domains = [];
        }
        return ProviderSchema.parse({ id: p.id, label: p.label, domains });
      })
    );
    const domainsByProvider = Object.fromEntries(
      providersList.map((p) => [p.id, p.domains])
    );
    return jsonOk({ providers: providersList, domainsByProvider });
  } catch (e) {
    return jsonError(e);
  }
}
