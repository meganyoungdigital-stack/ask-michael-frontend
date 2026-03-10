import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Michael AI",
  description: "Industrial AI intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex flex-col min-h-screen bg-black text-white">

          <main className="flex-1 flex flex-col min-h-0">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}