"use client";

import { useParams } from "next/navigation";

export default function ConversationPage() {

  const params = useParams();
const conversationId = params?.conversationId as string;

  return (
    <div className="flex flex-col h-screen p-6">

      <h1 className="text-xl font-bold mb-4">
        Conversation {conversationId}
      </h1>

      <div className="flex-1 border rounded-lg p-4">
        Chat interface loading...
      </div>

    </div>
  );

}