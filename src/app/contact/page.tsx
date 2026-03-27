"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
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
          Contact & Support
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Get in touch for support, platform inquiries, or collaboration opportunities. We aim to respond promptly to all queries related to the system.
        </p>

        <div className="flex justify-center gap-4">
          <a href="mailto:askmichael@askmichaelai.org">
            <Button size="lg">Email Support</Button>
          </a>

          <Link href="/portal">
            <Button variant="outline" size="lg">
              Go to Platform
            </Button>
          </Link>
        </div>
      </div>

      {/* CONTACT OPTIONS */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                General Inquiries
              </h3>
              <p className="text-muted-foreground">
                For questions about the platform, features, or general usage, please reach out via email.
                <br /><br />
                📧 askmichael@askmichaelai.org
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Technical Support
              </h3>
              <p className="text-muted-foreground">
                Report issues, bugs, or system errors. Include as much detail as possible to help diagnose and resolve problems efficiently.
                <br /><br />
                Response times may vary depending on system load and complexity.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Business & Partnerships
              </h3>
              <p className="text-muted-foreground">
                For enterprise use, integrations, or partnership opportunities, contact us to discuss how the platform can support your operations.
                <br /><br />
                We work with industrial teams to improve workflows and system intelligence.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Feedback & Improvements
              </h3>
              <p className="text-muted-foreground">
                Suggestions and feedback are welcome to help improve the platform’s functionality and usability.
                <br /><br />
                Continuous improvement is a core part of the system’s development.
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* CONTACT SUMMARY */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-4"
        >
          Direct Communication Channel
        </motion.h2>

        <p className="text-muted-foreground">
          All communication is handled via a centralized email channel to ensure proper tracking, response management, and support continuity.
        </p>
      </div>

      {/* NOTICE */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              Response Policy
            </h3>
            <p className="text-muted-foreground text-sm">
              This platform provides support for system-related inquiries and operational assistance.
              <br /><br />
              Response times may vary depending on request complexity and system demand.
              <br /><br />
              For critical issues, include detailed information in your message to facilitate faster resolution.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Need Assistance?
        </h3>

        <p className="text-muted-foreground mb-6">
          Contact us directly and we’ll help you get the support you need.
        </p>

        <div className="flex justify-center gap-4">
          <a href="mailto:askmichael@askmichaelai.org">
            <Button size="lg">Send Email</Button>
          </a>

          <Link href="/portal">
            <Button variant="outline" size="lg">
              Go to Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}