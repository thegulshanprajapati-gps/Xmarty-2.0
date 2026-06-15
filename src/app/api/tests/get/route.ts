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
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Missing test ID" }, { status: 400 });
    }

    const db = await getDb();
    const test = await db.collection("tests").findOne({
      _id: (ObjectId.isValid(id) ? new ObjectId(id) : id) as any
    });

    if (!test) {
      return Response.json({ error: "Test not found" }, { status: 404 });
    }

    // Protect test page: verify that this test is allotted to the student
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

    // Strip answers from questions to prevent cheating
    const studentQuestions = test.questions?.map((q: any) => {
      const { correctOptionId, correctBool, correctWord, ...rest } = q;
      return rest;
    }) || [];

    const studentTest = {
      id: test._id?.toString() || test.id,
      title: test.title,
      description: test.description,
      time_limit: test.time_limit,
      pass_marks: test.pass_marks,
      questions: studentQuestions,
    };

    return Response.json({ test: studentTest });
  } catch (err: any) {
    console.error("Failed to get test:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
