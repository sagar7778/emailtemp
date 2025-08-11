import { NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { shouldThrottle, jsonOk, jsonError } from "@/lib/api/utils";

export const runtime = "nodejs";

const QuerySchema = z.object({ text: z.string().min(1) });

export async function GET(req: NextRequest) {
  try {
    if (shouldThrottle(req)) {
      return jsonError(new Error("RATE_LIMIT"), 429);
    }
    const url = new URL(req.url);
    const text = url.searchParams.get("text") || "";
    const { text: safeText } = QuerySchema.parse({ text });
    const buffer = await QRCode.toBuffer(safeText, { type: "png", width: 256 });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Failed to generate QR code." }), { status: 400 });
  }
}
