import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "./globals.css";

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
      <html lang="en">
        <body className="bg-white text-gray-900">

          {/* Global Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}