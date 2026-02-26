import { auth } from "@clerk/nextjs/server";
import Sidebar from "@/components/Sidebar";
import { getUserConversations } from "@/lib/mongodb";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

export default async function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  let conversations: Conversation[] = [];

  if (userId) {
    try {
      conversations = await getUserConversations(userId);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

  return (
    <div className="flex h-full">
      <Sidebar conversations={conversations} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}