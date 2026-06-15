import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, answers } = await request.json();
    if (!sessionId || !answers) {
      return Response.json({ error: "Missing sessionId or answers" }, { status: 400 });
    }

    const db = await getDb();
    
    // Save/update sync draft inside attempts answers backup collection
    await db.collection("exam_attempt_syncs").updateOne(
      { sessionId, studentId: session.id },
      { 
        $set: { 
          answers, 
          lastSynced: new Date() 
        } 
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Offline sync error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
