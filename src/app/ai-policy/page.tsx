"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AIPolicyPage() {
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
          AI Usage & Responsibility Policy
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Guidelines for the responsible use of AI-assisted tools within engineering and operational workflows.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">Access Platform</Button>
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
                AI-Assisted, Not Autonomous
              </h3>
              <p className="text-muted-foreground">
                This platform provides AI-assisted outputs designed to support users in analysis, research, and decision-making.
                <br /><br />
                It does not operate autonomously and does not replace human judgment, professional expertise, or certified engineering review.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                No Guarantee of Accuracy
              </h3>
              <p className="text-muted-foreground">
                AI-generated outputs may contain inaccuracies, omissions, or incomplete information.
                <br /><br />
                Users are responsible for independently verifying all outputs before relying on them for operational, technical, or compliance-related decisions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Compliance Responsibility
              </h3>
              <p className="text-muted-foreground">
                The platform may assist in accessing standards and technical references, but it does not guarantee regulatory compliance.
                <br /><br />
                Users remain solely responsible for ensuring that all work complies with applicable laws, standards, and certification requirements.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Appropriate Use
              </h3>
              <p className="text-muted-foreground">
                Users agree to use the platform responsibly and in accordance with applicable laws and regulations.
                <br /><br />
                The platform must not be used for unsafe, unlawful, or high-risk activities without proper professional oversight.
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* SECTION 5 */}
      <div className="max-w-4xl mx-auto mt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Data Responsibility
              </h3>
              <p className="text-muted-foreground">
                Users are responsible for ensuring that any data uploaded to the platform complies with data protection laws, confidentiality obligations, and internal policies.
                <br /><br />
                Sensitive or regulated information should only be used in accordance with applicable governance requirements.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* LEGAL DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Important Notice
            </h3>
            <p className="text-muted-foreground text-sm">
              This platform provides AI-assisted tools intended to support engineering and operational workflows.
              <br /><br />
              It does not replace professional judgment, certified review processes, or regulatory compliance requirements.
              <br /><br />
              By using this platform, users acknowledge and accept responsibility for verifying outputs and making final decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Use AI Responsibly in Your Workflow
        </h3>

        <p className="text-muted-foreground mb-6">
          Access AI-assisted tools designed to support — not replace — your expertise.
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