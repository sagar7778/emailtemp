import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;
      let intervalId: NodeJS.Timeout | null = null;
      
      const send = (data: string) => {
        if (!isClosed && controller.desiredSize !== null) {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            isClosed = true;
            if (intervalId) clearInterval(intervalId);
          }
        }
      };
      
      // Send initial data
      send('retry: 10000\n');
      send('event: tick\ndata: {"tick":0}\n\n');
      send(': keep-alive\n\n');
      
      // Set up interval for periodic messages
      let tick = 1;
      intervalId = setInterval(() => {
        if (isClosed) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        
        try {
          send(`event: tick\ndata: {"tick":${tick++}}\n\n`);
          send(': keep-alive\n\n');
        } catch (error) {
          isClosed = true;
          if (intervalId) clearInterval(intervalId);
        }
      }, 8000);
      
      // Handle cleanup
      const cleanup = () => {
        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
      
      // Override controller methods to handle cleanup
      const originalClose = controller.close.bind(controller);
      controller.close = () => {
        cleanup();
        originalClose();
      };
      
      const originalError = controller.error.bind(controller);
      controller.error = (reason) => {
        cleanup();
        originalError(reason);
      };
    },
    
    cancel() {
      // Handle cancellation
    },
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
