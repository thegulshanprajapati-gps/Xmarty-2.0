import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await request.json();
    if (!testId) {
      return Response.json({ error: "Missing testId" }, { status: 400 });
    }

    const db = await getDb();
    
    // Find the test
    const test = await db.collection("tests").findOne({
      _id: (ObjectId.isValid(testId) ? new ObjectId(testId) : testId) as any
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Verify allotment
    const allFolders = await db.collection('course_folders').find({ course_id: 'assessments' }).toArray();
    const studentFolder = allFolders.find((f: any) => f.metadata?.student_id === session.id);
    if (!studentFolder) {
      return Response.json({ error: "Access Denied: You do not have permission to access this test." }, { status: 403 });
    }

    const studentFolderId = studentFolder._id.toString();
    const descendants: any[] = [];
    const queue: string[] = [studentFolderId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = allFolders.filter((f: any) => String(f.parent_folder_id) === currentId);
      for (const child of children) {
        descendants.push(child);
        queue.push(child._id.toString());
      }
    }
    const titles = descendants.map((f: any) => f.title);
    const testIdStr = test._id?.toString() || test.id;
    const isAllotted = titles.includes(testIdStr) || titles.includes(test.title);
    if (!isAllotted) {
      return Response.json({ error: "Access Denied: This test is not allotted to you." }, { status: 403 });
    }

    // Check if an active exam session already exists for this student and test
    const existingSession = await db.collection("exam_attempt_questions").findOne({
      studentId: session.id,
      examId: testIdStr,
      completed: { $ne: true }
    });

    if (existingSession) {
      return Response.json({ sessionId: existingSession.sessionId });
    }

    // Create session and randomize sequence
    const sessionId = crypto.randomUUID();
    const questions = test.questions || [];
    
    // Randomize question sequence
    const shuffledQuestions = shuffleArray(questions);
    const frozenQuestions = shuffledQuestions.map((q: any) => q.id);

    // Randomize option sequence for MCQ type questions
    const frozenOptions: Record<string, string[]> = {};
    shuffledQuestions.forEach((q: any) => {
      if (q.type === 'mcq' && Array.isArray(q.options)) {
        const shuffledOpts = shuffleArray(q.options);
        frozenOptions[q.id] = shuffledOpts.map((o: any) => o.id);
      }
    });

    const attemptQuestionsRecord = {
      sessionId,
      studentId: session.id,
      examId: testIdStr,
      frozenQuestions,
      frozenOptions,
      createdAt: new Date(),
      completed: false
    };

    await db.collection("exam_attempt_questions").insertOne(attemptQuestionsRecord);

    return Response.json({ sessionId });
  } catch (err: any) {
    console.error("Failed to start exam session:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
