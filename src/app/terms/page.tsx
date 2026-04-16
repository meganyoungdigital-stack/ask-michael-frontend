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
          {t.termsHeroTitle}
        </motion.h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {t.termsHeroText}
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

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3>{t.termsSection1Title}</h3>
              <p>
                {t.termsSection1Text1}
                <br /><br />
                {t.termsSection1Text2}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3>{t.termsSection2Title}</h3>
              <p>
                {t.termsSection2Text1}
                <br /><br />
                {t.termsSection2Text2}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3>{t.termsSection3Title}</h3>
              <p>
                {t.termsSection3Text1}
                <br /><br />
                {t.termsSection3Text2}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div>
          <Card className="p-6 rounded-2xl shadow">
            <CardContent>
              <h3>{t.termsSection4Title}</h3>
              <p>
                {t.termsSection4Text1}
                <br /><br />
                {t.termsSection4Text2}
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* SINGLE SECTIONS */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3>{t.termsSection5Title}</h3>
            <p>
              {t.termsSection5Text1}
              <br /><br />
              {t.termsSection5Text2}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3>{t.termsSection6Title}</h3>
            <p>
              {t.termsSection6Text1}
              <br /><br />
              {t.termsSection6Text2}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3>{t.termsSection7Title}</h3>
            <p>
              {t.termsSection7Text1}
              <br /><br />
              {t.termsSection7Text2}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-6 rounded-2xl shadow">
          <CardContent>
            <h3>{t.termsSection8Title}</h3>
            <p>
              {t.termsSection8Text1}
              <br /><br />
              {t.termsSection8Text2}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-4xl mx-auto mt-24">
        <Card className="p-6 rounded-2xl border">
          <CardContent>
            <h3>{t.termsDisclaimerTitle}</h3>
            <p>
              {t.termsDisclaimerText1}
              <br /><br />
              {t.termsDisclaimerText2}
              <br /><br />
              {t.termsDisclaimerText3}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center mt-24">
        <h3>{t.termsFinalTitle}</h3>
        <p>{t.termsFinalText}</p>

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