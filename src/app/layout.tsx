import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
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
          <div className="flex h-screen">

            {/* Sidebar only appears when signed in */}
            <SignedIn>
              <Sidebar />
            </SignedIn>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}