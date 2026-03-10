import "./globals.css";
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
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}