import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: 'heartbeat', value: 'Connected' });

      const interval = setInterval(() => {
        const events = [
          { type: 'viewers', value: Math.floor(Math.random() * 10) + 1 },
          { type: 'hint', value: 'Drag features to reorganize' },
          { type: 'hint', value: 'Click Publish to share' },
          { type: 'heartbeat', value: 'Active' },
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        sendEvent(randomEvent);
      }, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
