"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

export default function ContactPage() {
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
          {t.contactTitle}
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {t.contactDescription}
        </p>

        <div className="flex justify-center gap-4">
          <a href="mailto:askmichael@askmichaelai.org">
            <Button size="lg">{t.contactEmailSupport}</Button>
          </a>

          <Link href="/portal">
            <Button variant="outline" size="lg">
              {t.contactGoToPlatform}
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
                {t.contactSection1Title}
              </h3>
              <p className="text-muted-foreground">
                {t.contactSection1Text}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 2 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.contactSection2Title}
              </h3>
              <p className="text-muted-foreground">
                {t.contactSection2Text}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 3 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.contactSection3Title}
              </h3>
              <p className="text-muted-foreground">
                {t.contactSection3Text}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION 4 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3 className="text-xl font-semibold mb-3">
                {t.contactSection4Title}
              </h3>
              <p className="text-muted-foreground">
                {t.contactSection4Text}
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
          {t.contactSummaryTitle}
        </motion.h2>

        <p className="text-muted-foreground">
          {t.contactSummaryText}
        </p>
      </div>

      {/* NOTICE */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border border-border">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3">
              {t.contactPolicyTitle}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t.contactPolicyText}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          {t.contactFinalCtaTitle}
        </h3>

        <p className="text-muted-foreground mb-6">
          {t.contactFinalCtaText}
        </p>

        <div className="flex justify-center gap-4">
          <a href="mailto:askmichael@askmichaelai.org">
            <Button size="lg">{t.contactSendEmail}</Button>
          </a>

          <Link href="/portal">
            <Button variant="outline" size="lg">
              {t.contactGoToPlatform}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}