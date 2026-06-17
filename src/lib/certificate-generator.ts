import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { Db } from "mongodb";
import fs from "fs";
import path from "path";
// Hex to RGB color helper
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

// Escape XML helper
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Replace PPTX placeholder helper
function replacePPTXPlaceholder(xml: string, placeholder: string, value: string): string {
  const escapedVal = escapeXml(value);
  const chars = placeholder.split('');
  const regexStr = '\\{\\s*(<[^>]+>\\s*)*' + chars.map(c => `${c}(\\s*<[^>]+>\\s*)*`).join('') + '\\}';
  const regex = new RegExp(regexStr, 'g');
  return xml.replace(regex, escapedVal);
}

export async function generateCertificateFile(
  db: Db,
  cert: {
    studentName: string;
    examTitle: string;
    certificateId: string;
    type: string;
    generatedAt: Date | string;
  }
): Promise<{ fileType: 'pptx' | 'pdf'; base64Data: string }> {
  const certType = cert.type || "completion";
  const certTitle = certType === "participation" ? "CERTIFICATE OF PARTICIPATION" : "CERTIFICATE OF COMPLETION";

  const pptxTemplate = await db.collection("certificate_templates").findOne({ type: certType });

  const settings = await db.collection("site_settings").findOne({}, { sort: { updated_at: -1 } });
  const templateBase64 = settings?.certificate_template || "";

  const isBold = settings?.cert_font_bold !== false;
  const isItalic = settings?.cert_font_italic === true;
  const fontColorHex = settings?.cert_font_color || "#cc3333";
  const titleColorHex = settings?.cert_title_color || "#1e3a8a";
  const examColorHex = settings?.cert_exam_color || "#33994c";

  let pdfDoc;
  let page;
  let isFromPptx = false;

  if (pptxTemplate && pptxTemplate.fileDataPdf) {
    try {
      const base64String = pptxTemplate.fileDataPdf.includes(",") ? pptxTemplate.fileDataPdf.split(",")[1] : pptxTemplate.fileDataPdf;
      const pdfBuffer = Buffer.from(base64String, 'base64');
      pdfDoc = await PDFDocument.load(pdfBuffer);
      page = pdfDoc.getPages()[0];
      isFromPptx = true;
    } catch (err) {
      console.error("Failed to load PDF background from PPTX template, falling back:", err);
    }
  }

  if (!pdfDoc || !page) {
    pdfDoc = await PDFDocument.create();
    page = pdfDoc.addPage([800, 600]);
    
    // Draw default border/image template if not using PPTX template
    const hasImageTemplate = templateBase64 && (templateBase64.startsWith("data:image/") || templateBase64.startsWith("http://") || templateBase64.startsWith("https://"));

    if (hasImageTemplate) {
      try {
        let imageBytes: Buffer;
        let isPng = false;
        if (templateBase64.startsWith("http://") || templateBase64.startsWith("https://")) {
          const fetchRes = await fetch(templateBase64);
          const arrayBuffer = await fetchRes.arrayBuffer();
          imageBytes = Buffer.from(arrayBuffer);
          const contentType = fetchRes.headers.get("content-type") || "";
          isPng = contentType.includes("image/png") || templateBase64.toLowerCase().endsWith(".png");
        } else {
          imageBytes = Buffer.from(templateBase64.split(",")[1], 'base64');
          isPng = templateBase64.includes("image/png");
        }

        let img;
        if (isPng) {
          img = await pdfDoc.embedPng(imageBytes);
        } else {
          img = await pdfDoc.embedJpg(imageBytes);
        }
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: 800,
          height: 600
        });
      } catch (err) {
        console.error("Failed to embed background template image:", err);
      }
    } else {
      const { width, height } = page.getSize();
      page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderColor: rgb(0.2, 0.4, 0.8),
        borderWidth: 5,
      });
    }
  }

  const { width, height } = page.getSize();

  // Parse colors
  const parsedFontColor = hexToRgb(fontColorHex);
  const fontColor = rgb(parsedFontColor.r, parsedFontColor.g, parsedFontColor.b);

  const parsedTitleColor = hexToRgb(titleColorHex);
  const titleColor = rgb(parsedTitleColor.r, parsedTitleColor.g, parsedTitleColor.b);

  const parsedExamColor = hexToRgb(examColorHex);
  const examColor = rgb(parsedExamColor.r, parsedExamColor.g, parsedExamColor.b);

  // Helper to resolve font per element
  let cachedCursiveFont: any = null;
  const resolveFontForElement = async (family: string, elementBold: boolean, elementItalic: boolean) => {
    const fontName = family || "helvetica";
    if (fontName === "times") {
      if (elementBold && elementItalic) return await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
      if (elementBold) return await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      if (elementItalic) return await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      return await pdfDoc.embedFont(StandardFonts.TimesRoman);
    } else if (fontName === "courier") {
      if (elementBold && elementItalic) return await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);
      if (elementBold) return await pdfDoc.embedFont(StandardFonts.CourierBold);
      if (elementItalic) return await pdfDoc.embedFont(StandardFonts.CourierOblique);
      return await pdfDoc.embedFont(StandardFonts.Courier);
    } else if (fontName === "cursive") {
      if (cachedCursiveFont) return cachedCursiveFont;
      try {
        const fontPath = path.join(process.cwd(), "src", "lib", "assets", "GreatVibes.ttf");
        if (fs.existsSync(fontPath)) {
          const fontBytes = fs.readFileSync(fontPath);
          cachedCursiveFont = await pdfDoc.embedFont(fontBytes);
          return cachedCursiveFont;
        }
      } catch (err) {
        console.error("Failed to load cursive font, falling back to Helvetica:", err);
      }
    }
    // Default/fallback to Helvetica
    if (elementBold && elementItalic) return await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    if (elementBold) return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    if (elementItalic) return await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  };

  // 1. Draw Title ONLY if NOT using PPTX template and NOT using custom image template.
  if (!isFromPptx && !(templateBase64 && (templateBase64.startsWith("data:image/") || templateBase64.startsWith("http://") || templateBase64.startsWith("https://")))) {
    const titleFont = await resolveFontForElement("helvetica", true, false);
    page.drawText(certTitle, {
      x: 180,
      y: 480,
      size: 30,
      font: titleFont,
      color: titleColor,
    });

    page.drawText("This is proudly presented to", {
      x: 280,
      y: 390,
      size: 16,
      font: titleFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`for successfully passing the assessment:`, {
      x: 230,
      y: 260,
      size: 14,
      font: titleFont,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Mapped/custom layout configurations
  const layout = (certType === "participation"
    ? (settings?.cert_layout_participation || settings?.cert_layout)
    : (settings?.cert_layout_completion || settings?.cert_layout)) || {
    studentName: { x: 400, y: 310, fontSize: 26, color: fontColorHex },
    examTitle: { x: 400, y: 200, fontSize: 20, color: examColorHex },
    certificateId: { x: 50, y: 60, fontSize: 10, color: "#808080" },
    verificationKey: { x: 50, y: 45, fontSize: 10, color: "#808080" },
    dateOfCompletion: { x: 400, y: 120, fontSize: 12, color: "#808080" }
  };

  // Helper to draw centered text at coordinate X
  const drawTextCentered = (text: string, config: { x: number; y: number; fontSize: number; color: string }, elementFont: any) => {
    const size = config.fontSize || 12;
    const colorHex = config.color || "#000000";
    const rgbColor = hexToRgb(colorHex);
    const textWidth = elementFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: Math.max(10, config.x - textWidth / 2),
      y: Math.max(10, config.y - size / 3),
      size: size,
      font: elementFont,
      color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
    });
  };

  // Helper to draw left-aligned metadata
  const drawTextNormal = (text: string, config: { x: number; y: number; fontSize: number; color: string }, elementFont: any) => {
    const size = config.fontSize || 10;
    const colorHex = config.color || "#808080";
    const rgbColor = hexToRgb(colorHex);
    page.drawText(text, {
      x: Math.max(10, config.x),
      y: Math.max(10, config.y - size / 3),
      size: size,
      font: elementFont,
      color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
    });
  };

  // 2. Draw student name
  const studentName = cert.studentName || "Student";
  if (layout.studentName) {
    const studentFont = await resolveFontForElement(layout.studentName.fontFamily, isBold, isItalic);
    drawTextCentered(studentName, layout.studentName, studentFont);
  }

  // 3. Draw Assessment Title
  const examTitle = cert.examTitle || "Skill Assessment";
  if (layout.examTitle) {
    const examFont = await resolveFontForElement(layout.examTitle.fontFamily, false, false);
    drawTextCentered(examTitle, layout.examTitle, examFont);
  }

  // 4. Draw Certificate ID (No Prefix)
  if (layout.certificateId) {
    const certIdFont = await resolveFontForElement(layout.certificateId.fontFamily, false, false);
    drawTextNormal(cert.certificateId, layout.certificateId, certIdFont);
  }

  // 5. Draw Verification Key (No Prefix)
  if (layout.verificationKey) {
    const vKeyFont = await resolveFontForElement(layout.verificationKey.fontFamily, false, false);
    drawTextNormal(cert.certificateId, layout.verificationKey, vKeyFont);
  }

  // 6. Draw Date of Completion
  if (layout.dateOfCompletion) {
    const docFont = await resolveFontForElement(layout.dateOfCompletion.fontFamily, false, false);
    const docDate = new Date(cert.generatedAt).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    drawTextCentered(docDate, layout.dateOfCompletion, docFont);
  }

  const pdfBytes = await pdfDoc.save();
  const base64Pdf = Buffer.from(pdfBytes).toString("base64");

  return { fileType: 'pdf', base64Data: base64Pdf };
}
