import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import {
  ClerkProvider,
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

            {/* HEADER */}
            <header className="h-16 flex items-center justify-between px-6 border-b bg-white">

              {/* LEFT: LOGO */}
              <div className="flex items-center">
                <Image
                  src="/m-logo.png"
                  alt="Ask Michael Logo"
                  width={160}
                  height={40}
                  priority
                />
              </div>

              {/* RIGHT: AUTH */}
              <div>
                <SignedOut>
                  <SignInButton mode="modal" />
                </SignedOut>

                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>

            </header>

            {/* MAIN */}
            <div className="flex flex-1 overflow-hidden">

              <SignedIn>
                <Sidebar />
              </SignedIn>

              <main className="flex-1 overflow-y-auto">
                {children}
              </main>

            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}