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
          style={{
            margin: 0,
            background: "#ffffff",
            color: "#2f2f2f",
          }}
        >
          {/* Fixed Top Bar */}
          <header
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 24px",
              background: "#ffffff",
              borderBottom: "1px solid #e5e5e5",
              zIndex: 100,
            }}
          >
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>

          {/* Main App Layout */}
          <div
            style={{
              display: "flex",
              height: "100vh",
              paddingTop: "64px", // prevent header overlap
            }}
          >
            {/* Sidebar */}
            <div
              style={{
                width: "260px",
                borderRight: "1px solid #e5e5e5",
                background: "#ffffff",
              }}
            >
              <Sidebar />
            </div>

            {/* Main Content */}
            <main
              style={{
                flex: 1,
                padding: "32px",
                overflowY: "auto",
                background: "#ffffff",
                color: "#2f2f2f",
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