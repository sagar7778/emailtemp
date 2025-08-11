import { NextRequest, NextResponse } from "next/server";

// Very basic in-memory throttle map (best-effort; not production-grade)
const lastSeen = new Map<string, number>();

export function shouldThrottle(req: NextRequest, minIntervalMs = 300): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const last = lastSeen.get(ip) ?? 0;
  lastSeen.set(ip, now);
  return now - last < minIntervalMs;
}

export type PublicErrorCode =
  | "BAD_REQUEST"
  | "PROVIDER_UNAVAILABLE"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";

export function mapErrorToPublic(err: unknown): { code: PublicErrorCode; message: string } {
  const msg = (err as any)?.message ?? "";
  if (msg?.toLowerCase?.().includes("rate") || msg === "RATE_LIMIT") {
    return { code: "RATE_LIMITED", message: "Too many requests. Please try again." };
  }
  if (msg?.toLowerCase?.().includes("not found")) {
    return { code: "NOT_FOUND", message: "Resource not found." };
  }
  if (msg?.toLowerCase?.().includes("provider") || msg?.toLowerCase?.().includes("network")) {
    return { code: "PROVIDER_UNAVAILABLE", message: "Mail provider is currently unavailable." };
  }
  if (msg?.toLowerCase?.().includes("invalid") || msg?.toLowerCase?.().includes("missing")) {
    return { code: "BAD_REQUEST", message: "Invalid request." };
  }
  return { code: "UNKNOWN_ERROR", message: "Something went wrong." };
}

export function jsonOk(data: any, headers?: Record<string, string>) {
  return NextResponse.json(data, { headers });
}

export function jsonError(err: unknown, status = 400) {
  const mapped = mapErrorToPublic(err);
  // Minimal server-side logging; do not leak secrets
  console.warn("API_ERROR", { code: mapped.code });
  return NextResponse.json({ error: mapped.code, message: mapped.message }, { status });
}
