export const dynamic = 'force-dynamic';
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const attempts = await db.collection('test_attempts')
      .find({ user_id: session.id })
      .sort({ submitted_at: -1 })
      .toArray();

    const tests = await db.collection('tests').find({}).toArray();
    const formatted = attempts.map((a: any) => {
      const t = tests.find((tItem: any) => tItem._id.toString() === a.test_id || tItem.id === a.test_id);
      return {
        id: a._id.toString(),
        test_id: a.test_id,
        test_title: a.test_title,
        score: a.score,
        total_marks: a.total_marks,
        percentage: a.percentage,
        passed: a.passed,
        time_spent: a.time_spent,
        submitted_at: a.submitted_at,
        leaderboard_enabled: t?.leaderboard_enabled || false,
        type: t?.type || 'standard',
      };
    });

    return Response.json({ attempts: formatted });
  } catch (err: any) {
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
