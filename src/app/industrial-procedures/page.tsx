"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function IndustrialProceduresPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-start items-center">
        <Link href="/">
          <Button variant="outline">← Back Home</Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          Industrial Procedures & Workflows
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Support the creation, review, and management of industrial procedures using AI-assisted tools designed to enhance consistency and operational awareness.
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

      {/* SECTION GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Procedure Development Support
              </h3>
              <p className="text-muted-foreground">
                Assist in drafting and structuring industrial procedures using AI-supported guidance based on existing documentation and standards.
                <br /><br />
                Outputs are intended to support internal workflows and should be reviewed and approved by qualified personnel before use.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Standard Alignment Assistance
              </h3>
              <p className="text-muted-foreground">
                Reference relevant standards and internal guidelines to support alignment of procedures with expected practices.
                <br /><br />
                The platform does not certify compliance and all procedures must be validated against applicable standards by the user.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Workflow Structuring
              </h3>
              <p className="text-muted-foreground">
                Organize procedures into structured workflows to improve clarity, traceability, and consistency across operations.
                <br /><br />
                These structures are intended to support operational visibility and should be adapted to site-specific requirements.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Review & Continuous Improvement
              </h3>
              <p className="text-muted-foreground">
                Identify potential gaps, inconsistencies, or areas for improvement in existing procedures using AI-assisted analysis.
                <br /><br />
                Insights are intended to support review processes and should be validated before implementation.
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
          Designed for Industrial Environments
        </motion.h2>

        <p className="text-muted-foreground">
          Support teams in managing procedures across multiple operational stages, from development to execution and review, within a unified system.
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
              This platform provides AI-assisted tools intended to support the development and management of industrial procedures.
              <br /><br />
              It does not replace professional judgment, certified engineering review, or regulatory compliance processes.
              <br /><br />
              Users are responsible for verifying all outputs, ensuring compliance with applicable standards, and approving procedures prior to implementation.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Improve Your Industrial Workflows with AI Support
        </h3>

        <p className="text-muted-foreground mb-6">
          Use AI-assisted tools to support procedure development, consistency, and operational clarity.
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