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

    const { certificateId, type } = await request.json();
    if (!certificateId || !type) {
      return Response.json({ error: "Missing certificateId or type" }, { status: 400 });
    }

    const db = await getDb();
    
    // Find the certificate
    let cert = await db.collection("certificates").findOne({
      _id: (ObjectId.isValid(certificateId) ? new ObjectId(certificateId) : certificateId) as any
    });

    if (!cert) {
      cert = await db.collection("certificates").findOne({ certificateId });
      if (!cert) {
        return Response.json({ error: "Certificate not found" }, { status: 404 });
      }
    }
    
    return updateCert(cert, type, db);
  } catch (err: any) {
    console.error("Update type error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

async function updateCert(cert: any, type: string, db: any) {
  // Retrieve original test attempt
  const attempt = await db.collection("test_attempts").findOne({
    test_id: cert.examId,
    user_id: cert.studentId
  });

  if (!attempt) {
    return Response.json({ error: "Attempt details not found" }, { status: 404 });
  }

  const { fileType, base64Data } = await generateCertificateFile(db, {
    studentName: cert.studentName,
    examTitle: cert.examTitle,
    certificateId: cert.certificateId,
    type,
    generatedAt: cert.generatedAt
  });

  // Save changes
  await db.collection("certificates").updateOne(
    { _id: cert._id },
    {
      $set: {
        fileType,
        pptxData: fileType === 'pptx' ? base64Data : null,
        pdfData: fileType === 'pdf' ? base64Data : null,
        type
      }
    }
  );

  return Response.json({ success: true });
}
