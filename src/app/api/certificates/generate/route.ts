import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { generateCertificateFile } from "@/lib/certificate-generator";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId, attemptId } = await request.json();
    if (!examId || !attemptId) {
      return Response.json({ error: "Missing examId or attemptId" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if certificate already exists
    const existing = await db.collection("certificates").findOne({
      studentId: session.id,
      examId: examId
    });

    if (existing) {
      return Response.json({ success: true, certificateId: existing.certificateId });
    }

    // Retrieve attempt details
    const attempt = await db.collection("test_attempts").findOne({
      _id: (ObjectId.isValid(attemptId) ? new ObjectId(attemptId) : attemptId) as any
    });

    if (!attempt || !attempt.passed) {
      return Response.json({ error: "Only passing attempts can generate certificates" }, { status: 400 });
    }

    const certificateId = `CERT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const requestBody = await request.clone().json().catch(() => ({}));
    const certType = requestBody.type || "completion";

    const studentName = session.full_name || session.name || "Student";
    const examTitle = attempt.test_title || "Skill Assessment";
    const generatedAt = new Date();

    const { fileType, base64Data } = await generateCertificateFile(db, {
      studentName,
      examTitle,
      certificateId,
      type: certType,
      generatedAt
    });

    const certificate = {
      certificateId,
      studentId: session.id,
      studentName,
      examId,
      examTitle,
      generatedAt,
      verificationUrl: `/verify-certificate/${certificateId}`,
      passed: true,
      fileType,
      pptxData: fileType === 'pptx' ? base64Data : null,
      pdfData: fileType === 'pdf' ? base64Data : null,
      type: certType
    };

    await db.collection("certificates").insertOne(certificate);

    const notification = {
      userId: session.id,
      title: "Certificate Generated!",
      message: `Your certificate for ${examTitle} is ready for download.`,
      link: "/profile?tab=certificate",
      type: "success",
      read: false,
      createdAt: new Date()
    };
    await db.collection("notifications").insertOne(notification);

    return Response.json({ success: true, certificateId });
  } catch (err: any) {
    console.error("Failed to generate certificate:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
