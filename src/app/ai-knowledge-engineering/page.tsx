"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function KnowledgePage() {
 
  const lang = useLanguage();
  const t = translations[lang as "en" | "zu" | "af" | "fr"];

  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-start items-center">
        <Link href="/">
          <Button variant="outline">{t.backToPlatform}</Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          {t.aiKnowledge}
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Organize, retrieve, and interact with engineering knowledge using AI-assisted tools designed to support informed decision-making.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">{t.enterPlatform}</Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 1 */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Structured Knowledge Retrieval
              </h3>
              <p className="text-muted-foreground">
                Access engineering standards, internal documentation, and technical resources through an AI-assisted retrieval system.
                <br /><br />
                The platform surfaces relevant information to support workflows, while interpretation and application remain the responsibility of qualified professionals.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Context-Aware Document Analysis
              </h3>
              <p className="text-muted-foreground">
                Analyze documents with AI-assisted context awareness, enabling faster navigation of complex engineering materials.
                <br /><br />
                Outputs are intended to support review processes and should be verified before use in any operational or compliance context.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                AI-Assisted Querying
              </h3>
              <p className="text-muted-foreground">
                Interact with your knowledge base using natural language queries to retrieve relevant insights efficiently.
                <br /><br />
                The system is designed to assist exploration and does not guarantee completeness or accuracy of retrieved results.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Custom Knowledge Integration
              </h3>
              <p className="text-muted-foreground">
                Integrate proprietary documents and datasets into a unified knowledge environment tailored to your organization.
                <br /><br />
                Users are responsible for ensuring appropriate permissions, data governance, and compliance with applicable regulations.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* WORKFLOW */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-4"
        >
          Built for Engineering Workflows
        </motion.h2>

        <p className="text-muted-foreground">
          Designed to support engineers, analysts, and technical teams in managing and interacting with complex knowledge systems across multiple stages of work.
        </p>
      </div>

      {/* LEGAL DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Important Notice
            </h3>
            <p className="text-muted-foreground text-sm">
              This platform provides AI-assisted knowledge retrieval and analysis tools intended to support engineering workflows.
              <br /><br />
              It does not replace professional judgment, certified engineering review, or regulatory compliance processes.
              <br /><br />
              Users are responsible for verifying outputs, ensuring compliance with applicable standards, and making final decisions based on their professional expertise.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Start Using AI-Assisted Knowledge Tools
        </h3>

        <p className="text-muted-foreground mb-6">
          Enhance how your team accesses and interacts with engineering knowledge.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">Start Free</Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}