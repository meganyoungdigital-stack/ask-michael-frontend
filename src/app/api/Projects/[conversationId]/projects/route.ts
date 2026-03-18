import { NextResponse } from "next/server";
import { getUserConversations } from "@/lib/mongodb";

export async function GET() {
  const userId = "demo-user"; // replace with real auth later

  const conversations = await getUserConversations(userId);

  return NextResponse.json(conversations);
}