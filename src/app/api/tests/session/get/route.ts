export const dynamic = 'force-dynamic';
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return Response.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    const db = await getDb();
    
    // Retrieve the frozen layout sequence
    const frozenRecord = await db.collection("exam_attempt_questions").findOne({
      sessionId,
      studentId: session.id
    });

    if (!frozenRecord) {
      return Response.json({ error: "Exam session not found or access denied" }, { status: 404 });
    }

    // Retrieve the raw test
    const testId = frozenRecord.examId;
    const test = await db.collection("tests").findOne({
      _id: (ObjectId.isValid(testId) ? new ObjectId(testId) : testId) as any
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Map questions by ID for fast lookup
    const rawQuestions = test.questions || [];
    const questionsMap = new Map(rawQuestions.map((q: any) => [q.id, q]));

    // Reconstruct the frozen sequence of questions
    const orderedQuestions: any[] = [];
    const frozenQuestions: string[] = frozenRecord.frozenQuestions || [];

    frozenQuestions.forEach((qId: string) => {
      const q = questionsMap.get(qId) as any;
      if (q) {
        // Shuffled options order map check
        let finalOptions = q.options;
        const frozenOpts = frozenRecord.frozenOptions?.[qId];
        
        if (q.type === 'mcq' && Array.isArray(q.options) && Array.isArray(frozenOpts)) {
          const optsMap = new Map(q.options.map((o: any) => [o.id, o]));
          finalOptions = frozenOpts.map((oId: string) => optsMap.get(oId)).filter(Boolean);
        }

        const { correctOptionId, correctBool, correctWord, ...studentQuestionProps } = q;
        orderedQuestions.push({
          ...studentQuestionProps,
          options: finalOptions
        });
      }
    });

    const studentTest = {
      id: test._id?.toString() || test.id,
      title: test.title,
      description: test.description,
      time_limit: test.time_limit,
      pass_marks: test.pass_marks,
      questions: orderedQuestions
    };

    return Response.json({ test: studentTest, completed: frozenRecord.completed });
  } catch (err: any) {
    console.error("Failed to load secure session test:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
