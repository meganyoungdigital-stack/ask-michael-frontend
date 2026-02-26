import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Sidebar from "@/components/Sidebar";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

async function getConversations(userId: string): Promise<Conversation[]> {
  if (!userId) return [];

  // ✅ Next.js 16 requires await
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) return [];

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/conversations`, {
    cache: "no-store",
  });

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