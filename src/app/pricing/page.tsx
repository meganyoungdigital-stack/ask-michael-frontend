"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

/* ✅ NEW */
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function PricingPage() {
  const lang = useLanguage();
  const t = translations[lang as "en" | "zu" | "af" | "fr"];
  const { user } = useUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("paystack-script")) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.id = "paystack-script";

    document.body.appendChild(script);
  }, []);

  const plans = [
    {
      name: t.planFree,
      price: t.planFreePrice,
      plan: "free",
      features: {
        chat: true,
        rag: false,
        intelligence: false,
        cad: false,
        priority: false,
      },
      highlight: false,
    },
    {
      name: t.planPro,
      price: t.planProPrice,
      plan: "pro",
      features: {
        chat: true,
        rag: true,
        intelligence: false,
        cad: false,
        priority: true,
      },
      highlight: true,
    },
    {
      name: t.planProPlus,
      price: t.planProPlusPrice,
      plan: "pro_plus",
      features: {
        chat: true,
        rag: true,
        intelligence: true,
        cad: true,
        priority: true,
      },
      highlight: false,
    },
  ];

  const handleCheckout = async (plan: string) => {
    if (!user) {
      alert(t.pricingAlertSignIn);
      return;
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      alert(t.pricingAlertNoEmail);
      return;
    }

    if (plan === "free") {
      window.location.href = "/portal";
      return;
    }

    if (typeof window === "undefined" || !(window as any).PaystackPop) {
      alert(t.pricingAlertLoading);
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      alert(t.pricingAlertConfig);
      return;
    }

    const amount = plan === "pro" ? 4900 : 12900;

    const handler = (window as any).PaystackPop.setup({
      key: paystackKey,
      email: user.primaryEmailAddress.emailAddress,
      plan:
        plan === "pro"
          ? process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN
          : process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLUS_PLAN,
      currency: "ZAR",
      metadata: {
        userId: user.id,
        plan: plan,
      },
      callback: function (response: any) {
        (async () => {
          try {
            await fetch("/api/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                userId: user.id,
                plan,
              }),
            });

            window.location.href = "/portal";
          } catch (error) {
            console.error("Verification failed:", error);
            alert(t.pricingAlertVerifyFail);
          }
        })();
      },
      onClose: function () {
        console.log("Payment window closed");
      },
    });

    handler.openIframe();
  };

  const Feature = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="w-5 h-5" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground" />
    );

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      
      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline">{t.backToPlatform}</Button>
        </Link>

        <Link href="/portal">
          <Button>{t.goToPlatform}</Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1 className="text-5xl font-bold mb-4">
          {t.pricingHeroTitle}
        </motion.h1>
        <p className="text-lg text-muted-foreground">
          {t.pricingHeroText}
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div key={plan.plan}>
            <Card className={`p-6 rounded-2xl shadow-lg border ${plan.highlight ? "border-primary scale-105" : ""}`}>
              <CardContent>
                {plan.highlight && (
                  <div className="mb-2 text-sm font-semibold text-primary">
                    {t.pricingMostPopular}
                  </div>
                )}

                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="text-4xl font-bold my-4">{plan.price}</p>

                <Button className="w-full" size="lg" onClick={() => handleCheckout(plan.plan)}>
                  {t.pricingGetStarted}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto mt-24">
        <h3 className="text-3xl font-semibold text-center mb-10">
          {t.pricingCompareTitle}
        </h3>

        <div className="grid grid-cols-4 gap-4 items-center text-center">
          <div></div>
          {plans.map((p) => (
            <div key={p.plan}>{p.name}</div>
          ))}

          <div className="text-left">{t.featureChat}</div>
          {plans.map((p) => <Feature key={p.plan+"c"} value={p.features.chat} />)}

          <div className="text-left">{t.featureRag}</div>
          {plans.map((p) => <Feature key={p.plan+"r"} value={p.features.rag} />)}

          <div className="text-left">{t.featureIntelligence}</div>
          {plans.map((p) => <Feature key={p.plan+"i"} value={p.features.intelligence} />)}

          <div className="text-left">{t.featureCad}</div>
          {plans.map((p) => <Feature key={p.plan+"cad"} value={p.features.cad} />)}

          <div className="text-left">{t.featurePriority}</div>
          {plans.map((p) => <Feature key={p.plan+"p"} value={p.features.priority} />)}
        </div>
      </div>

      {/* ENTERPRISE */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <h3 className="text-3xl font-semibold mb-4">
          {t.pricingEnterpriseTitle}
        </h3>
        <p className="text-muted-foreground mb-6">
          {t.pricingEnterpriseText}
        </p>

        <a href="mailto:askmichael@askmichaelai.org">
          <Button size="lg">{t.pricingContactSales}</Button>
        </a>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 rounded-2xl shadow">
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                {t.pricingTestimonialText}
              </p>
              <div className="font-semibold">
                {t.pricingTestimonialAuthor}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          {t.pricingFinalTitle}
        </h3>

        <Link href="/portal">
          <Button size="lg">{t.enterPlatform}</Button>
        </Link>
      </div>
    </div>
  );
}