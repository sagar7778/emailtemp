import { NextRequest, NextResponse } from "next/server";
import { getActiveProviders } from "@/lib/providers";
import { z } from "zod";

export const runtime = "nodejs";

const ProviderSchema = z.object({
  id: z.string(),
  label: z.string(),
  domains: z.array(z.string()),
});

export async function GET(req: NextRequest) {
  try {
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
    return NextResponse.json({ providers: providersList, domainsByProvider });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch providers." }, { status: 500 });
  }
}
