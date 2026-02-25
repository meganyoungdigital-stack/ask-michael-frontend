import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
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
          {/* App Wrapper */}
          <div className="flex flex-col h-screen">

            {/* Fixed Top Bar */}
            <header
              className="h-16 flex items-center justify-end px-6 border-b bg-white"
            >
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>

          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}