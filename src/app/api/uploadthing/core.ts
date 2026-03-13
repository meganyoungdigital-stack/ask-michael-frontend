import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { getUser, addAttachmentToConversation } from "@/lib/mongodb";
import { indexPdfDocument } from "@/lib/pdfIndexer";
import { ObjectId } from "mongodb";

const f = createUploadthing();

/* ============================
   FILE ROUTER
============================ */

export const ourFileRouter = {
  conversationAttachment: f({
    pdf: { maxFileSize: "16MB" },
    image: { maxFileSize: "8MB" },
  })

    /* ============================
       AUTH MIDDLEWARE
    ============================ */

    .middleware(async () => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized");
      }

      const user = await getUser(userId);

      if (!user || user.tier !== "pro") {
        throw new Error("Upgrade required");
      }

      return { userId };
    })

    /* ============================
       AFTER UPLOAD
    ============================ */

    .onUploadComplete(async ({ metadata, file }) => {
      const conversationId = file.name.split("__")[0];

      /* SAVE ATTACHMENT */

      await addAttachmentToConversation(
        conversationId,
        metadata.userId,
        {
          name: file.name,
          url: file.url,
          type: file.type,
          uploadedAt: new Date(),
        }
      );

      /* ============================
         INDEX PDF FOR AI SEARCH
      ============================ */

      if (file.type === "application/pdf") {
        try {
          const response = await fetch(file.url);

          const arrayBuffer = await response.arrayBuffer();

          const buffer = Buffer.from(arrayBuffer);

          const documentId = new ObjectId().toString();

          await indexPdfDocument(
            buffer,
            metadata.userId,
            documentId
          );

          console.log("PDF indexed:", file.name);
        } catch (error) {
          console.error("PDF indexing failed:", error);
        }
      }

      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;