import { getDb } from "@/lib/mongodb";
import { generateCertificateFile } from "@/lib/certificate-generator";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Missing certificate ID" }, { status: 400 });
    }

    const db = await getDb();
    const cert = await db.collection("certificates").findOne({ certificateId: id });
    
    if (!cert) {
      return Response.json({ verified: false, error: "Invalid Certificate ID. This certificate cannot be verified." }, { status: 404 });
    }

    // Generate the file on-the-fly to always reflect latest templates and formatting fixes
    const { fileType, base64Data } = await generateCertificateFile(db, {
      studentName: cert.studentName,
      examTitle: cert.examTitle,
      certificateId: cert.certificateId,
      type: cert.type || 'completion',
      generatedAt: cert.generatedAt
    });

    return Response.json({
      verified: true,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      examTitle: cert.examTitle,
      generatedAt: cert.generatedAt,
      fileType,
      pdfData: fileType === 'pdf' ? base64Data : null,
      pptxData: fileType === 'pptx' ? base64Data : null,
      type: cert.type || 'completion'
    });
  } catch (err: any) {
    console.error("Failed to verify/generate certificate:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
