export const dynamic = 'force-dynamic';
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return Response.json({ error: "Missing testId" }, { status: 400 });
    }

    const db = await getDb();

    // Fetch test metadata
    const test = await db.collection("tests").findOne({
      _id: (ObjectId.isValid(testId) ? new ObjectId(testId) : testId) as any
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Retrieve all attempts for this test
    const attempts = await db.collection("test_attempts").find({ test_id: testId }).toArray();

    // Retrieve users profiles to map names and avatars
    const users = await db.collection("users").find({}).toArray();

    // Group attempts by user to display only their best attempt
    const userBestAttemptsMap: Record<string, any> = {};

    attempts.forEach((att: any) => {
      const userId = att.user_id;
      const currentBest = userBestAttemptsMap[userId];

      if (!currentBest || att.score > currentBest.score || (att.score === currentBest.score && att.time_spent < currentBest.time_spent)) {
        const u = users.find(usr => usr._id?.toString() === userId || usr.id === userId || usr.email === att.user_email);
        userBestAttemptsMap[userId] = {
          id: att._id?.toString() || att.id,
          userId,
          email: att.user_email,
          fullName: u?.full_name || att.user_email?.split("@")[0] || "Anonymous",
          profilePicture: u?.profile_picture || "",
          score: att.score,
          totalMarks: att.total_marks,
          percentage: att.percentage,
          timeSpent: att.time_spent || 0,
          submittedAt: att.submitted_at
        };
      }
    });

    // Convert map to sorted array
    const leaderboard = Object.values(userBestAttemptsMap).sort((a: any, b: any) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      if (a.timeSpent !== b.timeSpent) {
        return a.timeSpent - b.timeSpent; // Lower time taken first
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(); // Earlier submission first
    });

    // Add rank fields
    const rankedLeaderboard = leaderboard.map((item: any, index: number) => ({
      ...item,
      rank: index + 1
    }));

    return Response.json({
      testTitle: test.title,
      testDescription: test.description,
      leaderboardEnabled: test.leaderboard_enabled ?? false,
      leaderboard: rankedLeaderboard
    });
  } catch (err: any) {
    console.error("Leaderboard API error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
