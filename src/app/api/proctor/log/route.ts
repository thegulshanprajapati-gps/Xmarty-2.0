import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId, activityType, metadata } = await request.json();
    if (!examId || !activityType) {
      return Response.json({ error: "Missing examId or activityType" }, { status: 400 });
    }

    const db = await getDb();
    const logEntry = {
      studentId: session.id,
      studentEmail: session.email,
      studentName: session.full_name || session.name || "Student",
      examId,
      activityType,
      timestamp: new Date(),
      metadata: metadata || {}
    };

    await db.collection("exam_activity_logs").insertOne(logEntry);

    // Save alert notification for instructors/support if event is suspicious
    const suspiciousEvents = ['tab_blur', 'fullscreen_exit', 'idle_timeout'];
    if (suspiciousEvents.includes(activityType)) {
      const notification = {
        title: `Proctor Alert: Suspicious Activity`,
        message: `Student ${session.email} triggered a ${activityType.replace('_', ' ')} warning.`,
        type: 'alert',
        read: false,
        createdAt: new Date()
      };
      await db.collection("notifications").insertOne(notification);
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Failed to log proctor activity:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
