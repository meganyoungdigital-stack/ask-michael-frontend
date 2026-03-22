import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "./globals.css";
import BackButton from "@/components/BackButton";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Ask Michael",
  description: "AI Engineering Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body className="bg-black text-white">

          {/* Global Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="min-h-screen px-6 pb-10">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}