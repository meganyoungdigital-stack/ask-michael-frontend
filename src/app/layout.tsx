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
          {/* Top Right Auth Controls */}
          <header
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              padding: "16px",
              zIndex: 50,
              background: "white",
            }}
          >
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>

          {/* Main Content Area - Full Width */}
          <main
            style={{
              padding: "80px 24px 24px 24px",
              minHeight: "100vh",
              background: "#ffffff",
              color: "#2f2f2f",
            }}
          >
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}