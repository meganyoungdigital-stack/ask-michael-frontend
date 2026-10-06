/* ============================
   LAZY PDF PARSER
============================ */

let pdfParse: any = null;

async function getPdfParser() {
  if (!pdfParse) {
    const module: any = await import("pdf-parse");
    pdfParse = module.default || module;
  }

  return pdfParse;
}

/* ============================
   EXTRACT PDF TEXT
============================ */

export async function extractPdfText(fileBuffer: Buffer) {
  const pdf = await getPdfParser();

  const parsed = await pdf(fileBuffer);

  return parsed.text?.trim() || "";
}