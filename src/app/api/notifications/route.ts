import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const notifications = await db.collection("notifications")
      .find({ userId: session.id })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ notifications });
  } catch (err: any) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await request.json();
    const db = await getDb();

    if (markAll) {
      await db.collection("notifications").updateMany(
        { userId: session.id, read: false },
        { $set: { read: true } }
      );
      return Response.json({ success: true });
    }

    if (!notificationId) {
      return Response.json({ error: "Missing notificationId" }, { status: 400 });
    }

    await db.collection("notifications").updateOne(
      { _id: (ObjectId.isValid(notificationId) ? new ObjectId(notificationId) : notificationId) as any, userId: session.id },
      { $set: { read: true } }
    );

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
