import { connectToDatabase } from "@/lib/mongodb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  const shareId = params.shareId;

if (
  typeof shareId !== "string" ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    shareId
  )
) {
  return <div className="p-10">Not found</div>;
}

const { db } = await connectToDatabase();

const conversation = await db
    .collection("conversations")
    .findOne({
      shareId: params.shareId,
      isPublic: true,
    });

  if (!conversation) {
    return <div className="p-10">Not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">
        Shared Conversation
      </h1>

      {conversation.messages.map(
        (msg: any, i: number) => (
          <div key={i} className="mb-6">
            <div className="bg-gray-100 p-4 rounded-2xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        )
      )}
    </div>
  );
}