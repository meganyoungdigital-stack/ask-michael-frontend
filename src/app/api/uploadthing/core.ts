import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { getUser, addAttachmentToConversation } from "@/lib/mongodb";

const f = createUploadthing();

export const ourFileRouter = {
  conversationAttachment: f({
    pdf: { maxFileSize: "16MB" },
    image: { maxFileSize: "8MB" },
  })
    .middleware(async ({ req }) => {
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
    .onUploadComplete(async ({ metadata, file }) => {
      const conversationId = file.name.split("__")[0];

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

      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;