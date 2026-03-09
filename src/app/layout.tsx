import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
            background: "#000000",
            color: "#ffffff",
          }}
        >
          {/* TOP NAVBAR */}
          <Navbar />

          {/* PAGE CONTENT */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}