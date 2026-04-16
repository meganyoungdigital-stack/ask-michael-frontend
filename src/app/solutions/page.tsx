"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function SolutionsPage() {

  const lang = useLanguage();
  const t = translations[lang as "en" | "zu" | "af" | "fr"];

  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          {t.solutionsHeroTitle}
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {t.solutionsHeroText}
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">{t.enterPlatform}</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              {t.viewPricing}
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
                {t.solutionsSection1Title}
              </h3>
              <p className="text-muted-foreground">
                {t.solutionsSection1Text}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.solutionsSection2Title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t.solutionsSection2Text}
              </p>

              <ul className="text-sm text-muted-foreground space-y-2">
                <li>{t.solutionsSection2Bullet1}</li>
                <li>{t.solutionsSection2Bullet2}</li>
                <li>{t.solutionsSection2Bullet3}</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.solutionsSection3Title}
              </h3>
              <p className="text-muted-foreground">
                {t.solutionsSection3Text}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.solutionsSection4Title}
              </h3>
              <p className="text-muted-foreground">
                {t.solutionsSection4Text}
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
          {t.solutionsWorkflowTitle}
        </motion.h2>

        <p className="text-muted-foreground">
          {t.solutionsWorkflowText}
        </p>
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              {t.solutionsDisclaimerTitle}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t.solutionsDisclaimerText}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          {t.solutionsFinalTitle}
        </h3>

        <p className="text-muted-foreground mb-6">
          {t.solutionsFinalText}
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button size="lg">{t.startFree}</Button>
          </Link>

          <Link href="/pricing">
            <Button variant="outline" size="lg">
              {t.viewPricing}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}