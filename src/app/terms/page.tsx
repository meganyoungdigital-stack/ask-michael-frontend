"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function TermsPage() {
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
          Terms of Service
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          These terms govern your use of the platform and outline your rights and responsibilities as a user.
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

      {/* SECTION GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Acceptance of Terms
              </h3>
              <p className="text-muted-foreground">
                By accessing or using the platform, you agree to be bound by these Terms of Service.
                <br /><br />
                If you do not agree with these terms, you should not use the platform.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Use of the Platform
              </h3>
              <p className="text-muted-foreground">
                You agree to use the platform only for lawful purposes and in accordance with applicable regulations.
                <br /><br />
                You may not misuse the platform, attempt unauthorized access, or use it in a way that could harm its functionality or other users.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Accounts & Access
              </h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                <br /><br />
                The platform is not responsible for unauthorized access resulting from user actions or failure to secure credentials.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Payments & Subscriptions
              </h3>
              <p className="text-muted-foreground">
                Certain features of the platform may require payment through third-party providers such as Paystack.
                <br /><br />
                Subscription terms, billing cycles, and pricing are subject to change and will be presented at the time of purchase.
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
                Intellectual Property
              </h3>
              <p className="text-muted-foreground">
                The platform, including its design, functionality, and content, is owned by its providers and is protected by applicable intellectual property laws.
                <br /><br />
                Users may not copy, modify, distribute, or reverse-engineer any part of the platform without authorization.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SECTION 6 */}
      <div className="max-w-4xl mx-auto mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Termination of Use
              </h3>
              <p className="text-muted-foreground">
                Access to the platform may be suspended or terminated at any time if these terms are violated or if required for operational or legal reasons.
                <br /><br />
                Users may discontinue use of the platform at any time.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SECTION 7 */}
      <div className="max-w-4xl mx-auto mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Limitation of Liability
              </h3>
              <p className="text-muted-foreground">
                To the extent permitted by law, the platform and its providers shall not be liable for any damages arising from the use of, or inability to use, the platform.
                <br /><br />
                This includes reliance on AI-generated outputs, data, or system functionality.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SECTION 8 */}
      <div className="max-w-4xl mx-auto mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Changes to Terms
              </h3>
              <p className="text-muted-foreground">
                These terms may be updated from time to time.
                <br /><br />
                Continued use of the platform after updates constitutes acceptance of the revised terms.
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
              By using the platform, you acknowledge and accept responsibility for verifying outputs and making final decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Start Using the Platform
        </h3>

        <p className="text-muted-foreground mb-6">
          Access AI-assisted tools designed to support your workflows responsibly.
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