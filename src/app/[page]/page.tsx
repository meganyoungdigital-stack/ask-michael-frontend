import BackHome from "@/components/BackHome";
import { notFound } from "next/navigation";

type PageData = {
  title: string;
  content: string[];
};

const pages: Record<string, PageData> = {
  solutions: {
    title: "Solutions",
    content: [
      "Ask Michael AI provides AI-powered solutions for engineering and industrial environments.",
      "Our platform supports knowledge engineering, maintenance intelligence and industrial procedures.",
    ],
  },

  pricing: {
    title: "Pricing",
    content: [
      "Standard Plan — $29 / month",
      "Enterprise Plan — Contact us for enterprise pricing.",
    ],
  },

  contact: {
    title: "Contact",
    content: [
      "For enquiries regarding Ask Michael AI please contact our team.",
      "Email: contact@askmichael.ai",
    ],
  },

  privacy: {
    title: "Privacy Policy",
    content: [
      "Ask Michael AI respects user privacy.",
      "Information is used only for providing AI services.",
    ],
  },

  terms: {
    title: "Terms of Service",
    content: [
      "By using Ask Michael AI you agree to the platform terms.",
    ],
  },

  "ai-policy": {
    title: "AI Policy",
    content: [
      "AI responses must be validated by qualified professionals.",
    ],
  },

  "knowledge-engineering": {
    title: "AI Knowledge Engineering",
    content: [
      "Ask Michael AI structures technical knowledge for industrial environments.",
    ],
  },

  "industrial-procedures": {
    title: "Industrial Procedures",
    content: [
      "Ask Michael AI assists with structured operational procedures.",
    ],
  },

  "maintenance-intelligence": {
    title: "Maintenance Intelligence",
    content: [
      "AI insights supporting maintenance planning and diagnostics.",
    ],
  },
};

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {

  const { page } = await params;

  const pageData = pages[page];

  if (!pageData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto">

        <BackHome />

        <h1 className="text-4xl font-bold mb-10">
          {pageData.title}
        </h1>

        {pageData.content.map((paragraph, index) => (
          <p
            key={index}
            className="mb-6 text-gray-300 leading-relaxed"
          >
            {paragraph}
          </p>
        ))}

      </div>
    </main>
  );
}