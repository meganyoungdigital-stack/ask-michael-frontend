import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Sidebar from "../components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ask Michael",
  description: "Expert advice on aluminium smelting maintenance",
};

async function getConversations(userId: string) {
  if (!userId) return [];

  // 🔁 Replace this with your real DB call
  // Example:
  // return await db.conversation.findMany({ where: { userId } });

  return [];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const conversations = userId
    ? await getConversations(userId)
    : [];

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          style={{
            margin: 0,
            background: "#ffffff",
            color: "#2f2f2f",
          }}
        >
          <div className="flex flex-col h-screen">
            
            {/* Top Header */}
            <header className="h-16 flex items-center justify-end px-6 border-b bg-white">
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>

            {/* Main Row */}
            <div className="flex flex-1 overflow-hidden">

              <SignedIn>
                <Sidebar
                  conversations={conversations}
                  activeId=""
                />
              </SignedIn>

              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>

            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}