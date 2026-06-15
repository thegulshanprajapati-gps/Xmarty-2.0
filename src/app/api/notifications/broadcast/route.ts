import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { testId, testTitle } = await request.json();
    if (!testId || !testTitle) {
      return Response.json({ error: "Missing testId or testTitle" }, { status: 400 });
    }

    const db = await getDb();
    
    // Retrieve all student accounts
    const students = await db.collection("users").find({ role: { $in: ["student", "user"] } }).toArray();
    
    if (students.length === 0) {
      return Response.json({ success: true, count: 0 });
    }

    // Check if notification already exists to avoid duplication
    const existingNotif = await db.collection("notifications").findOne({
      link: `/leaderboard/${testId}`
    });

    if (existingNotif) {
      return Response.json({ success: true, count: 0, msg: "Already broadcasted" });
    }

    // Create notifications for all students
    const notifications = students.map((std: any) => ({
      userId: std._id?.toString() || std.id,
      title: "Contest Leaderboard Live! 🏆",
      message: `The leaderboard for contest "${testTitle}" is now live. Click to view ranks!`,
      type: "info",
      link: `/leaderboard/${testId}`,
      read: false,
      createdAt: new Date()
    }));

    await db.collection("notifications").insertMany(notifications);

    return Response.json({ success: true, count: notifications.length });
  } catch (err: any) {
    console.error("Broadcast notification error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
