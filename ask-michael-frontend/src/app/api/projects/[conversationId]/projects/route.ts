import { NextResponse } from "next/server";
import { getConversationsForUser } from "@/lib/mongodb";

export async function GET() {
  const userId = "demo-user"; // replace with real auth later

  const conversations = await getConversationsForUser(userId);

  return NextResponse.json(conversations);
}