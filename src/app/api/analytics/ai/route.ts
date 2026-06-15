import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ai, hasGeminiApiKey } from "@/ai/genkit";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'instructor')) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await request.json();
    if (!testId) {
      return Response.json({ error: "Missing testId" }, { status: 400 });
    }

    const db = await getDb();
    
    // Aggregate test attempts metrics
    const attempts = await db.collection("test_attempts").find({ test_id: testId }).toArray();
    
    if (attempts.length === 0) {
      return Response.json({ 
        summary: "No attempts recorded for this test yet. Performance analysis will be available once students complete assessments." 
      });
    }

    const totalAttempts = attempts.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const passRate = Math.round((passedCount / totalAttempts) * 100);
    const avgScore = Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttempts);

    let aiOutput = "";

    if (hasGeminiApiKey()) {
      try {
        const promptText = `
          Analyze the student assessment statistics:
          - Total Attempts: ${totalAttempts}
          - Pass Rate: ${passRate}%
          - Average Percentage Score: ${avgScore}%

          Provide a concise 3-sentence summary of class performance, identify potential topic weaknesses, and recommend actionable advice (remedial tests, revision lectures). Keep it brief, professional, and clear.
        `;

        const response = await ai.generate(promptText);
        aiOutput = response.text || "AI analysis completed with empty output.";
      } catch (err: any) {
        console.error("Genkit Gemini generation failure:", err);
        aiOutput = `Performance review: The class has achieved a ${passRate}% pass rate with an average score of ${avgScore}%. Focus on subjects showing high error rates.`;
      }
    } else {
      aiOutput = `Performance review (Standard): The class has achieved a ${passRate}% pass rate with an average score of ${avgScore}% across ${totalAttempts} attempts. Focus on subjects showing high error rates.`;
    }

    return Response.json({ 
      summary: aiOutput,
      stats: {
        totalAttempts,
        passRate,
        avgScore
      }
    });
  } catch (err: any) {
    console.error("AI assisted class summary failure:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
