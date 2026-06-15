import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'instructor' && session.role !== 'support')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const examId = url.searchParams.get("examId");

    const db = await getDb();
    let lastChecked = new Date();

    const stream = new ReadableStream({
      async start(controller) {
        // Heartbeat function to prevent timeout
        const sendHeartbeat = () => {
          try { controller.enqueue(new TextEncoder().encode(": heartbeat\n\n")); } catch {}
        };
        const heartbeatInterval = setInterval(sendHeartbeat, 15000);

        const checkLogs = async () => {
          try {
            const query: Record<string, any> = { timestamp: { $gt: lastChecked } };
            if (examId) {
              query.examId = examId;
            }
            const logs = await db.collection("exam_activity_logs")
              .find(query)
              .sort({ timestamp: 1 })
              .toArray();

            if (logs.length > 0) {
              lastChecked = logs[logs.length - 1].timestamp;
              logs.forEach(log => {
                const message = `data: ${JSON.stringify(log)}\n\n`;
                controller.enqueue(new TextEncoder().encode(message));
              });
            }
          } catch (e) {
            console.error("Proctor stream database query failure", e);
          }
        };

        const interval = setInterval(checkLogs, 3000);

        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          clearInterval(heartbeatInterval);
          try { controller.close(); } catch {}
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
