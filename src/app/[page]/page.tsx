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
      "Enterprise clients can deploy Ask Michael AI to assist with operational knowledge and decision support.",
    ],
  },

  contact: {
    title: "Contact",
    content: [
      "For enquiries regarding Ask Michael AI, platform integrations or enterprise deployments please contact our team.",
      "Email: contact@askmichael.ai",
      "Enterprise clients may request consultation regarding industrial AI deployment.",
    ],
  },

  pricing: {
    title: "Pricing",
    content: [
      "Standard Plan — $29 / month",
      "Enterprise Plan — Custom integrations and industrial AI deployment.",
      "Contact us for enterprise pricing.",
    ],
  },

  privacy: {
    title: "Privacy Policy",
    content: [
      "Ask Michael AI respects user privacy.",
      "Information is used only for providing AI services.",
      "The platform does not sell personal information.",
    ],
  },

  terms: {
    title: "Terms of Service",
    content: [
      "By using Ask Michael AI you agree to the platform terms.",
      "Outputs are AI generated and may contain inaccuracies.",
      "Users are responsible for validating generated information.",
    ],
  },

  "ai-policy": {
    title: "AI Policy",
    content: [
      "Ask Michael AI provides AI-assisted informational support within engineering and industrial environments.",
      "Outputs may contain inaccuracies and must be validated by qualified professionals.",
      "The platform does not provide certified engineering advice.",
    ],
  },

  "industrial-procedures": {
    title: "Industrial Procedure Assistance",
    content: [
      "Ask Michael AI assists professionals in structuring operational procedures.",
      "The system can help draft procedure documentation and operational checklists.",
      "All outputs must be reviewed by qualified personnel before use.",
    ],
  },

  "knowledge-engineering": {
    title: "AI Knowledge Engineering Assistance",
    content: [
      "Ask Michael AI helps structure and analyze technical knowledge in industrial environments.",
      "The platform assists in converting operational knowledge into documentation and training resources.",
      "Outputs should be interpreted as informational assistance only.",
    ],
  },

  "maintenance-intelligence": {
    title: "Maintenance Intelligence",
    content: [
      "Ask Michael AI supports maintenance planning and diagnostic analysis.",
      "The platform assists with troubleshooting insights and maintenance documentation.",
      "AI responses should not replace professional engineering assessment.",
    ],
  },
};

/* Tell Next which pages exist */

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({
    page,
  }));
}

export const dynamicParams = false;

export default function DynamicPage({
  params,
}: {
  params: { page: string };
}) {

  const page = pages[params.page];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto">

        <BackHome />

        <h1 className="text-4xl font-bold mb-10">
          {page.title}
        </h1>

        {page.content.map((paragraph, index) => (
          <p key={index} className="mb-6 text-gray-300 leading-relaxed">
            {paragraph}
          </p>
        ))}

      </div>
    </main>
  );
}