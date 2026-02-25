import { auth } from "@clerk/nextjs/server";
import Sidebar from "@/components/Sidebar";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

async function getConversations(userId: string): Promise<Conversation[]> {
  if (!userId) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/conversations`,
    {
      cache: "no-store",
      headers: {
        Cookie: "",
      },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data)
    ? data
    : data?.conversations || [];
}

export default async function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const conversations = userId
    ? await getConversations(userId)
    : [];

  return (
    <div className="flex h-full">
      <Sidebar conversations={conversations} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}