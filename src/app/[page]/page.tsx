import BackHome from "@/components/BackHome";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageData = {
  title: string;
  content: string[];
};

const pages: Record<string, PageData> = {

  app: {
    title: "Ask Michael Platform",
    content: [
      "Welcome to the Ask Michael AI platform.",
      "Log in to access engineering knowledge, AI conversations and operational decision support."
    ],
  },

  solutions: {
    title: "Solutions",
    content: [
      "Ask Michael AI provides AI-powered solutions for engineering and industrial environments.",
      "Our platform supports knowledge engineering, maintenance intelligence and industrial procedures.",
      "Enterprise clients can deploy Ask Michael AI to assist with operational knowledge and decision support."
    ],
  },

  contact: {
    title: "Contact",
    content: [
      "For enquiries regarding Ask Michael AI, platform integrations or enterprise deployments please contact our team.",
      "Email: contact@askmichael.ai"
    ],
  },

  pricing: {
    title: "Pricing",
    content: [
      "Standard Plan — $29 / month",
      "Enterprise Plan — Contact us for enterprise pricing."
    ],
  },

  privacy: {
    title: "Privacy Policy",
    content: [
      "Ask Michael AI respects user privacy.",
      "Information is used only for providing AI services."
    ],
  },

  terms: {
    title: "Terms of Service",
    content: [
      "By using Ask Michael AI you agree to the platform terms.",
      "Outputs are AI generated and may contain inaccuracies."
    ],
  },

  "ai-policy": {
    title: "AI Policy",
    content: [
      "Ask Michael AI provides AI-assisted informational support.",
      "Outputs must be validated by qualified professionals."
    ],
  },

  "knowledge-engineering": {
    title: "AI Knowledge Engineering",
    content: [
      "Ask Michael AI helps structure technical knowledge in industrial environments."
    ],
  },

  "industrial-procedures": {
    title: "Industrial Procedures",
    content: [
      "Ask Michael AI assists in drafting structured operational procedures."
    ],
  },

  "maintenance-intelligence": {
    title: "Maintenance Intelligence",
    content: [
      "Ask Michael AI supports maintenance planning and diagnostic insights."
    ],
  },

};

/* Allow only defined dynamic pages */
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({
    page,
  }));
}

export default function DynamicPage({
  params,
}: {
  params: { page: string };
}) {

  const pageData = pages[params.page];

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