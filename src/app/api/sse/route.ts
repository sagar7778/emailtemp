import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      function send(data: string) {
        controller.enqueue(encoder.encode(data));
      }
      send('retry: 10000\n');
      let tick = 0;
      const interval = setInterval(() => {
        send(`event: tick\ndata: {\"tick\":${tick++}}\n\n`);
        send(`: keep-alive\n\n`);
      }, 8000);
      // Initial event
      send(`event: tick\ndata: {\"tick\":0}\n\n`);
      send(`: keep-alive\n\n`);
      controller.close = () => clearInterval(interval);
    },
    cancel() {},
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
