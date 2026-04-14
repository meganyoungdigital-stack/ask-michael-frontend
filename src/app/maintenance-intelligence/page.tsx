"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function MaintenanceIntelligencePage() {
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
          Maintenance Intelligence
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Support maintenance planning and operational awareness with AI-assisted insights derived from data, logs, and system activity.
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

      {/* SECTION GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* SECTION 1 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Data-Driven Maintenance Insights
              </h3>
              <p className="text-muted-foreground">
                Analyze operational data, logs, and historical records to identify patterns that may be relevant to maintenance activities.
                <br /><br />
                The system highlights trends and observations to assist teams in understanding system behavior over time.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Anomaly Detection Support
              </h3>
              <p className="text-muted-foreground">
                Surface unusual patterns or deviations in system data that may require further investigation.
                <br /><br />
                These signals are intended to support awareness and should be reviewed by qualified personnel before action is taken.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Predictive Support for Planning
              </h3>
              <p className="text-muted-foreground">
                Use AI-assisted analysis to support planning by identifying potential risks or inefficiencies based on available data.
                <br /><br />
                Outputs are indicative and should not be interpreted as guaranteed predictions or maintenance recommendations.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                Maintenance Workflow Support
              </h3>
              <p className="text-muted-foreground">
                Integrate insights into maintenance workflows to improve visibility and coordination across teams.
                <br /><br />
                The platform supports decision-making processes but does not replace established maintenance procedures or protocols.
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
          Supporting Proactive Maintenance Strategies
        </motion.h2>

        <p className="text-muted-foreground">
          Designed to assist teams in improving maintenance awareness, planning efficiency, and operational visibility across industrial environments.
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
              This platform provides AI-assisted insights intended to support maintenance planning and operational awareness.
              <br /><br />
              It does not provide guaranteed predictions, maintenance instructions, or safety assurances.
              <br /><br />
              Users are responsible for verifying all outputs, following established procedures, and making final decisions based on qualified professional judgment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Improve Maintenance Visibility with AI Support
        </h3>

        <p className="text-muted-foreground mb-6">
          Use AI-assisted insights to support planning, identify trends, and enhance operational awareness.
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