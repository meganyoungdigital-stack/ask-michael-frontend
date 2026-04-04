import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    /* ✅ GET ID FROM QUERY PARAM */
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing PDF id", { status: 400 });
    }

    const record = await db.collection("pdf_exports").findOne({
      pdfId: id,
    });

    if (!record) {
      return new Response("PDF not found", { status: 404 });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    const stream = new PassThrough();
    doc.pipe(stream);

    /* ================= PDF CONTENT ================= */

    // Title
    doc
      .fontSize(18)
      .text(record.title || "Generated Document", {
        align: "center",
      });

    doc.moveDown();

    // Line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown();

    // Body content
    doc
      .fontSize(12)
      .text(record.content || "", {
        align: "left",
      });

    doc.moveDown();

    // Footer
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Generated on ${new Date().toLocaleString()}`, {
        align: "right",
      });

    doc.end();

    /* ================= BUFFER ================= */

    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          record.title || "AI_Document"
        }.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF ERROR:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}