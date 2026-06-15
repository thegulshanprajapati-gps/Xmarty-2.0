import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId, answers, timeSpent, sessionId } = await request.json();
    if (!testId) {
      return Response.json({ error: "Missing testId" }, { status: 400 });
    }

    const db = await getDb();
    
    if (sessionId) {
      await db.collection("exam_attempt_questions").updateOne(
        { sessionId, studentId: session.id },
        { $set: { completed: true } }
      );
    }
    
    // Find the test
    const test = await db.collection('tests').findOne({
      _id: (ObjectId.isValid(testId) ? new ObjectId(testId) : testId) as any
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Evaluate answers
    let score = 0;
    let totalPossible = 0;
    const questions = test.questions || [];

    questions.forEach((q: any) => {
      totalPossible += q.marks || 0;
      const studentAns = answers[q.id];

      if (studentAns !== undefined && studentAns !== null) {
        if (q.type === 'mcq') {
          if (String(studentAns).trim() === String(q.correctOptionId).trim()) {
            score += q.marks || 0;
          }
        } else if (q.type === 'true_false') {
          if (Boolean(studentAns) === Boolean(q.correctBool)) {
            score += q.marks || 0;
          }
        } else if (q.type === 'one_word') {
          const ansStr = String(studentAns).trim().toLowerCase();
          const correctStr = String(q.correctWord).trim().toLowerCase();
          if (ansStr === correctStr) {
            score += q.marks || 0;
          }
        }
      }
    });

    const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    const passed = percentage >= (test.pass_marks || 50);

    // Record the attempt
    const attempt = {
      user_id: session.id,
      user_email: session.email,
      test_id: testId,
      test_title: test.title,
      score,
      total_marks: totalPossible,
      percentage,
      passed,
      time_spent: timeSpent || 0,
      submitted_at: new Date(),
    };

    await db.collection('test_attempts').insertOne(attempt);

    return Response.json({
      success: true,
      score,
      total_marks: totalPossible,
      percentage,
      passed,
      questions
    });
  } catch (err: any) {
    console.error("Failed to submit test:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
