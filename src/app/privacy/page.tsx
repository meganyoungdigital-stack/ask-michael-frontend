"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-start items-center">
        <Link href="/">
          <Button variant="outline">
            ← Back to Platform
          </Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1 className="text-5xl font-bold mb-6">
          Privacy Policy
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Information on how data is collected, used, and managed when using
          this platform.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">
              Enter Platform →
            </Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Information We Collect
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`The platform may collect information such as account details, usage data, uploaded documents, and system interactions.

This information is used to operate, maintain, and improve the platform.`}
            </p>
          </CardContent>
        </Card>

        {/* SECTION 2 */}
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              How Data Is Used
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`Data may be used to provide platform functionality, generate AI-assisted outputs, improve system performance, and support user experience.

Data is processed only to the extent necessary for these purposes.`}
            </p>
          </CardContent>
        </Card>

        {/* SECTION 3 */}
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              AI Processing
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`Inputs provided by users may be processed by AI systems to generate outputs and insights.

Users should ensure that any data submitted complies with internal policies and applicable regulations.`}
            </p>
          </CardContent>
        </Card>

        {/* SECTION 4 */}
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Payments & Third-Party Services
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`Payments are processed through third-party providers such as Paystack.

These providers may collect and process payment information in accordance with their own privacy policies.`}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* SECTION 5 */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Data Security
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`Reasonable measures are taken to protect data against unauthorized access, loss, or misuse.

However, no system can guarantee complete security, and users should take appropriate precautions when sharing sensitive information.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 6 */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              User Responsibility
            </h3>

            <p className="text-muted-foreground whitespace-pre-line">
              {`Users are responsible for ensuring that any data uploaded to the platform complies with applicable laws, confidentiality obligations, and internal governance policies.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Important Notice
            </h3>

            <p className="text-muted-foreground text-sm whitespace-pre-line">
              {`This platform processes data to provide AI-assisted functionality and improve user experience.

By using the platform, users acknowledge that data may be processed in accordance with this policy.

Users remain responsible for ensuring lawful use of the platform and compliance with applicable data protection regulations.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center mt-24">

        <h3 className="text-3xl font-semibold mb-4">
          Use the Platform with Confidence
        </h3>

        <p className="text-muted-foreground mb-6">
          Built with data awareness and responsible processing in mind.
        </p>

        <div className="flex justify-center gap-4">

          <Link href="/portal">
            <Button size="lg">
              Start Free
            </Button>
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