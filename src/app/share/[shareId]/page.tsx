import { connectToDatabase } from "@/lib/mongodb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
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