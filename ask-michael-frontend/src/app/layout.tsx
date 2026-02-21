import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
          style={{ margin: 0 }}
        >
          {/* Top Right Auth Controls */}
          <header
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              padding: "16px",
              zIndex: 50,
            }}
          >
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>

          {/* Main Layout */}
          <div
            style={{
              display: "flex",
              height: "100vh",
            }}
          >
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main
              style={{
                flex: 1,
                padding: "80px 24px 24px 24px",
                overflowY: "auto",
                background: "#0f0f0f",
                color: "white",
              }}
            >
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}