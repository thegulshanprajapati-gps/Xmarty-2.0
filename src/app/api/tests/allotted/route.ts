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
    
    // Fetch all folders under Assessments course to resolve recursively
    const allFolders = await db.collection('course_folders').find({ course_id: 'assessments' }).toArray();
    
    // Find the folder corresponding to this student
    const studentFolder = allFolders.find((f: any) => f.metadata?.student_id === session.id);
    if (!studentFolder) {
      return Response.json({ tests: [] });
    }

    // Resolve all subfolders recursively
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

    // Fetch tests matching descendant titles (which represent test IDs)
    const tests = await db.collection('tests').find({}).toArray();
    const allottedTests = tests
      .filter((t: any) => {
        const tId = t._id?.toString() || t.id;
        return titles.includes(tId) || titles.includes(t.title);
      })
      .map((t: any) => ({
        id: t._id?.toString() || t.id,
        title: t.title,
        description: t.description,
        time_limit: t.time_limit,
        pass_marks: t.pass_marks,
        questionCount: t.questions?.length || 0,
        type: t.type || 'standard',
        leaderboard_enabled: t.leaderboard_enabled || false,
      }));

    return Response.json({ tests: allottedTests });
  } catch (err: any) {
    console.error("Failed to fetch allotted tests:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
