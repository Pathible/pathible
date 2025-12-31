/**
 * Script to generate a test PDF file for E2E testing
 *
 * Run with: node cypress/fixtures/generate-test-pdf.js
 *
 * Creates a ~250KB PDF file suitable for vault upload tests
 */

const fs = require("fs");
const path = require("path");

// Minimal PDF structure with content to reach ~250KB
function generateTestPDF() {
  // PDF header
  let pdf = "%PDF-1.4\n";

  // Object 1: Catalog
  pdf += "1 0 obj\n";
  pdf += "<< /Type /Catalog /Pages 2 0 R >>\n";
  pdf += "endobj\n";

  // Object 2: Pages
  pdf += "2 0 obj\n";
  pdf += "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n";
  pdf += "endobj\n";

  // Object 3: Page
  pdf += "3 0 obj\n";
  pdf +=
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n";
  pdf += "endobj\n";

  // Object 4: Content stream with test text
  const content = `BT
/F1 24 Tf
100 700 Td
(Pathible Test Document) Tj
0 -30 Td
/F1 12 Tf
(This is a test PDF for E2E testing.) Tj
0 -20 Td
(Generated for automated vault upload tests.) Tj
0 -20 Td
(File should be approximately 250KB.) Tj
0 -40 Td
(Test Categories: Legal Documents, Financial Records) Tj
0 -20 Td
(Created: ${new Date().toISOString()}) Tj
ET`;

  pdf += "4 0 obj\n";
  pdf += `<< /Length ${content.length} >>\n`;
  pdf += "stream\n";
  pdf += content;
  pdf += "\nendstream\n";
  pdf += "endobj\n";

  // Object 5: Font
  pdf += "5 0 obj\n";
  pdf += "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n";
  pdf += "endobj\n";

  // Object 6: Padding object to reach ~250KB
  // We'll add a large comment/metadata stream
  const targetSize = 250 * 1024; // 250KB
  const currentSize = Buffer.byteLength(pdf, "utf8");
  const paddingNeeded = targetSize - currentSize - 200; // Leave room for xref and trailer

  if (paddingNeeded > 0) {
    // Create padding as a metadata stream
    const paddingContent = "X".repeat(paddingNeeded);
    pdf += "6 0 obj\n";
    pdf += `<< /Type /Metadata /Length ${paddingContent.length} >>\n`;
    pdf += "stream\n";
    pdf += paddingContent;
    pdf += "\nendstream\n";
    pdf += "endobj\n";
  }

  // Cross-reference table
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n";
  pdf += "0 7\n";
  pdf += "0000000000 65535 f \n";
  pdf += "0000000009 00000 n \n";
  pdf += "0000000058 00000 n \n";
  pdf += "0000000115 00000 n \n";
  pdf += "0000000266 00000 n \n";
  pdf += "0000000484 00000 n \n";
  pdf += "0000000561 00000 n \n";

  // Trailer
  pdf += "trailer\n";
  pdf += "<< /Size 7 /Root 1 0 R >>\n";
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return pdf;
}

// Generate and save the PDF
const pdfContent = generateTestPDF();
const outputPath = path.join(__dirname, "test-document.pdf");

fs.writeFileSync(outputPath, pdfContent, "binary");

const stats = fs.statSync(outputPath);
console.log(`Generated test PDF: ${outputPath}`);
console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
