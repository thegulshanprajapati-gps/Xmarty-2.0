import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { Db } from "mongodb";

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

  // PPTX templates disabled — always generate PDF
  /*
  const pptxTemplate = await db.collection("certificate_templates").findOne({ type: certType });

  if (pptxTemplate && pptxTemplate.fileData) {
    try {
      const base64Data = pptxTemplate.fileData;
      const base64String = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
      const pptxBuffer = Buffer.from(base64String, 'base64');

      const zip = await JSZip.loadAsync(pptxBuffer);
      const slideFiles = Object.keys(zip.files).filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"));

      const studentName = cert.studentName;
      const examTitle = cert.examTitle;
      const docDate = new Date(cert.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      for (const slideName of slideFiles) {
        let xmlContent = await zip.file(slideName)!.async("string");
        
        xmlContent = replacePPTXPlaceholder(xmlContent, "name", studentName);
        xmlContent = replacePPTXPlaceholder(xmlContent, "Test", examTitle);
        xmlContent = replacePPTXPlaceholder(xmlContent, "v-key", cert.certificateId);
        xmlContent = replacePPTXPlaceholder(xmlContent, "c-id", cert.certificateId);
        xmlContent = replacePPTXPlaceholder(xmlContent, "doc", docDate);

        zip.file(slideName, xmlContent);
      }

      const generatedBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const base64Pptx = generatedBuffer.toString("base64");

      return { fileType: 'pptx', base64Data: base64Pptx };
    } catch (err) {
      console.error("Failed to generate PPTX dynamic template, falling back to PDF:", err);
    }
  }
  */

  // FALLBACK: PDF Generation
  const settings = await db.collection("site_settings").findOne({}, { sort: { updated_at: -1 } });
  const templateBase64 = settings?.certificate_template || "";

  const certFontFamily = settings?.cert_font_family || "helvetica";
  const isBold = settings?.cert_font_bold !== false;
  const isItalic = settings?.cert_font_italic === true;
  const fontColorHex = settings?.cert_font_color || "#cc3333";
  const titleColorHex = settings?.cert_title_color || "#1e3a8a";
  const examColorHex = settings?.cert_exam_color || "#33994c";

  // Select the font
  let fontName = StandardFonts.Helvetica;
  if (certFontFamily === "times") {
    if (isBold && isItalic) fontName = StandardFonts.TimesRomanBoldItalic;
    else if (isBold) fontName = StandardFonts.TimesRomanBold;
    else if (isItalic) fontName = StandardFonts.TimesRomanItalic;
    else fontName = StandardFonts.TimesRoman;
  } else if (certFontFamily === "courier") {
    if (isBold && isItalic) fontName = StandardFonts.CourierBoldOblique;
    else if (isBold) fontName = StandardFonts.CourierBold;
    else if (isItalic) fontName = StandardFonts.CourierOblique;
    else fontName = StandardFonts.Courier;
  } else { // helvetica
    if (isBold && isItalic) fontName = StandardFonts.HelveticaBoldOblique;
    else if (isBold) fontName = StandardFonts.HelveticaBold;
    else if (isItalic) fontName = StandardFonts.HelveticaOblique;
    else fontName = StandardFonts.Helvetica;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(fontName);

  // Parse colors
  const parsedFontColor = hexToRgb(fontColorHex);
  const fontColor = rgb(parsedFontColor.r, parsedFontColor.g, parsedFontColor.b);

  const parsedTitleColor = hexToRgb(titleColorHex);
  const titleColor = rgb(parsedTitleColor.r, parsedTitleColor.g, parsedTitleColor.b);

  const parsedExamColor = hexToRgb(examColorHex);
  const examColor = rgb(parsedExamColor.r, parsedExamColor.g, parsedExamColor.b);

  const hasImageTemplate = templateBase64 && templateBase64.startsWith("data:image/");

  if (hasImageTemplate) {
    try {
      const imageBytes = Buffer.from(templateBase64.split(",")[1], 'base64');
      let img;
      if (templateBase64.includes("image/png")) {
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
    // Draw default border if no background image is present
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 5,
    });
  }

  // 1. Draw Title
  // ONLY draw dynamic title if there's no custom image template.
  if (!hasImageTemplate) {
    page.drawText(certTitle, {
      x: 180,
      y: 480,
      size: 30,
      font,
      color: titleColor,
    });

    page.drawText("This is proudly presented to", {
      x: 280,
      y: 390,
      size: 16,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`for successfully passing the assessment:`, {
      x: 230,
      y: 260,
      size: 14,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // 2. Draw student name centered
  const studentName = cert.studentName || "Student";
  const nameWidth = font.widthOfTextAtSize(studentName, 26);
  const nameX = Math.max(50, (width - nameWidth) / 2);
  
  page.drawText(studentName, {
    x: nameX,
    y: 310,
    size: 26,
    font,
    color: fontColor,
  });

  // 3. Draw Assessment Title centered
  const examTitle = cert.examTitle || "Skill Assessment";
  const examWidth = font.widthOfTextAtSize(examTitle, 20);
  const examX = Math.max(50, (width - examWidth) / 2);

  page.drawText(examTitle, {
    x: examX,
    y: 200,
    size: 20,
    font,
    color: examColor,
  });

  // 4. Draw credential keys at the bottom left cleanly
  page.drawText(`Certificate ID: ${cert.certificateId}`, {
    x: 50,
    y: 60,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(`Verification Key: ${cert.certificateId}`, {
    x: 50,
    y: 45,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const base64Pdf = Buffer.from(pdfBytes).toString("base64");

  return { fileType: 'pdf', base64Data: base64Pdf };
}
