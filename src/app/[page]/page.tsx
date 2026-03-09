import BackHome from "@/components/BackHome";
import { notFound } from "next/navigation";

type PageData = {
  title: string;
  content: string[];
};

const pages: Record<string, PageData> = {
  "ai-documents": {
    title: "AI Document Assistance",
    content: [
      "Ask Michael AI assists users in generating structured operational documentation aligned with engineering, industrial and maintenance environments.",
      "The system can assist with drafting reports, inspection records, procedure documentation and structured knowledge summaries.",
      "All generated outputs should be reviewed and validated by qualified professionals before implementation.",
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

  contact: {
    title: "Contact",
    content: [
      "For enquiries regarding Ask Michael AI, platform integrations or enterprise deployments please contact our team.",
      "Email: contact@askmichael.ai",
      "Enterprise clients may request consultation regarding industrial AI deployment.",
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

  solutions: {
    title: "Solutions",
    content: [
      "AI Knowledge Engineering",
      "Industrial Procedure Assistance",
      "Maintenance Intelligence",
      "Technical Documentation Support",
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
};

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