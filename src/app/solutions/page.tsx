"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          Engineering Intelligence, Augmented by AI
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Support your engineering workflows with AI-assisted insights across standards, operations, and design — built to enhance decision-making, not replace it.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* SOLUTIONS GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* Section 1 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                AI-Assisted Access to Engineering Standards
              </h3>
              <p className="text-muted-foreground">
                Quickly explore and reference engineering standards, internal documentation, and technical knowledge through an AI-assisted interface.
                <br /><br />
                The platform helps surface relevant information to support your work — while final interpretation and compliance remain the responsibility of qualified professionals.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Data-Informed Operational Insights
              </h3>
              <p className="text-muted-foreground mb-4">
                Analyze production logs, sensor data, and operational inputs with AI-supported pattern recognition.
                <br /><br />
                The system highlights trends and potential anomalies to assist teams in identifying areas for further investigation.
              </p>

              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Detect patterns in production data</li>
                <li>• Surface anomalies for review</li>
                <li>• Support data-driven decision-making</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Predictive Analysis for Proactive Planning
              </h3>
              <p className="text-muted-foreground">
                Use AI-driven analysis to identify potential risks and inefficiencies based on historical and real-time data.
                <br /><br />
                These insights are intended to support planning and operational awareness, and should be validated by engineering teams before implementation.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                AI Co-Pilot for Drawings and Visual Data
              </h3>
              <p className="text-muted-foreground">
                Interact with engineering drawings, CAD files, and visual data using AI-assisted interpretation tools.
                <br /><br />
                The platform can help identify elements, highlight patterns, and support review workflows — while final verification remains the responsibility of the user.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* WORKFLOW SECTION */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-4"
        >
          One Platform, Multiple Engineering Functions
        </motion.h2>

        <p className="text-muted-foreground">
          Bring together knowledge retrieval, operational insights, and visual analysis into a unified workflow.
          <br /><br />
          Designed to integrate into existing engineering environments and support teams across multiple stages of the process.
        </p>
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Important Notice
            </h3>
            <p className="text-muted-foreground text-sm">
              This platform provides AI-assisted insights intended to support engineering workflows. It does not replace professional judgment, certified engineering review, or regulatory compliance processes.
              <br /><br />
              Users are responsible for verifying outputs, ensuring compliance with applicable standards, and making final decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Enhance Your Engineering Workflow with AI Support
        </h3>

        <p className="text-muted-foreground mb-6">
          Start using AI-assisted tools to support analysis, improve efficiency, and streamline engineering processes.
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