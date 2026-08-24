"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

/* Clerk */
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function PricingPage() {
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
      name: "Free",
      price: "$0",
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
      name: "Pro",
      price: "$49/mo",
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
      name: "Pro+",
      price: "$129/mo",
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
      alert("Please sign in first");
      return;
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      alert("No email found on your account");
      return;
    }

    if (plan === "free") {
      window.location.href = "/portal";
      return;
    }

    if (
      typeof window === "undefined" ||
      !(window as any).PaystackPop
    ) {
      alert("Payment system is still loading. Please try again.");
      return;
    }

    const paystackKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      alert("Payment system not configured correctly.");
      return;
    }

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
            const verifyResponse = await fetch(
              "/api/paystack/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reference: response.reference,
                  userId: user.id,
                  plan,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error(
                "Payment verification request failed"
              );
            }

            window.location.href = "/portal";
          } catch (error) {
            console.error(
              "Verification failed:",
              error
            );

            alert(
              "Payment verification failed. Please contact support."
            );
          }
        })();
      },

      onClose: function () {
        console.log("Payment window closed");
      },
    });

    handler.openIframe();
  };

  const Feature = ({
    value,
  }: {
    value: boolean;
  }) =>
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
          <Button variant="outline">
            ← Back to Platform
          </Button>
        </Link>

        <Link href="/portal">
          <Button>
            Go to Platform
          </Button>
        </Link>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1 className="text-5xl font-bold mb-4">
          Your AI Engineering Co-Pilot
        </motion.h1>

        <p className="text-lg text-muted-foreground">
          From standards to predictions to CAD — all in one platform
        </p>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <motion.div key={plan.plan}>
            <Card
              className={`p-6 rounded-2xl shadow-lg border ${
                plan.highlight
                  ? "border-primary scale-105"
                  : ""
              }`}
            >
              <CardContent>

                {plan.highlight && (
                  <div className="mb-2 text-sm font-semibold text-primary">
                    Most Popular
                  </div>
                )}

                <h2 className="text-2xl font-semibold">
                  {plan.name}
                </h2>

                <p className="text-4xl font-bold my-4">
                  {plan.price}
                </p>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    handleCheckout(plan.plan)
                  }
                >
                  Get Started
                </Button>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* PLAN COMPARISON */}
      <div className="max-w-6xl mx-auto mt-24">

        <h3 className="text-3xl font-semibold text-center mb-10">
          Compare Plans
        </h3>

        <div className="grid grid-cols-4 gap-4 items-center text-center">

          {/* HEADER */}
          <div></div>

          {plans.map((plan) => (
            <div key={plan.plan}>
              {plan.name}
            </div>
          ))}

          {/* AI CHAT */}
          <div className="text-left">
            AI Chat
          </div>

          {plans.map((plan) => (
            <Feature
              key={plan.plan + "chat"}
              value={plan.features.chat}
            />
          ))}

          {/* ENGINEERING RAG */}
          <div className="text-left">
            Engineering RAG
          </div>

          {plans.map((plan) => (
            <Feature
              key={plan.plan + "rag"}
              value={plan.features.rag}
            />
          ))}

          {/* OPERATIONAL INTELLIGENCE */}
          <div className="text-left">
            Operational Intelligence
          </div>

          {plans.map((plan) => (
            <Feature
              key={plan.plan + "intelligence"}
              value={plan.features.intelligence}
            />
          ))}

          {/* CAD */}
          <div className="text-left">
            CAD + Visual AI
          </div>

          {plans.map((plan) => (
            <Feature
              key={plan.plan + "cad"}
              value={plan.features.cad}
            />
          ))}

          {/* PRIORITY COMPUTE */}
          <div className="text-left">
            Priority Compute
          </div>

          {plans.map((plan) => (
            <Feature
              key={plan.plan + "priority"}
              value={plan.features.priority}
            />
          ))}

        </div>
      </div>

      {/* ENTERPRISE */}
      <div className="max-w-4xl mx-auto mt-24 text-center">

        <h3 className="text-3xl font-semibold mb-4">
          Enterprise
        </h3>

        <p className="text-muted-foreground mb-6">
          Custom deployments, private AI models, sensor
          integrations, and dedicated support.
        </p>

        <a href="mailto:askmichael@askmichaelai.org">
          <Button size="lg">
            Contact Sales
          </Button>
        </a>

      </div>

      {/* TESTIMONIALS */}
<div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">

  <Card className="p-6 rounded-2xl shadow">
    <CardContent>
      <p className="mb-4 text-muted-foreground">
        Ask Michael AI provides a practical way to work
        through complex aluminium smelting and engineering
        questions without spending hours searching through
        technical documentation.
      </p>

      <div className="font-semibold">
        Engineering Professional
      </div>

      <div className="text-sm text-muted-foreground">
        Aluminium &amp; Smelting
      </div>
    </CardContent>
  </Card>

  <Card className="p-6 rounded-2xl shadow">
    <CardContent>
      <p className="mb-4 text-muted-foreground">
        Having engineering standards, repair guidance and
        technical information available through one AI
        platform can make it much easier to investigate
        problems and develop a structured engineering response.
      </p>

      <div className="font-semibold">
        Maintenance &amp; Reliability Professional
      </div>

      <div className="text-sm text-muted-foreground">
        Industrial Engineering
      </div>
    </CardContent>
  </Card>

  <Card className="p-6 rounded-2xl shadow">
    <CardContent>
      <p className="mb-4 text-muted-foreground">
        The combination of engineering knowledge, document
        analysis and AI-assisted troubleshooting makes Ask
        Michael AI particularly useful for technical teams
        working with demanding industrial applications.
      </p>

      <div className="font-semibold">
        Technical Engineering Professional
      </div>

      <div className="text-sm text-muted-foreground">
        Heavy Industry
      </div>
    </CardContent>
  </Card>

</div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">

        <h3 className="text-3xl font-semibold mb-4">
          Start Using AI in Your Engineering Workflow
        </h3>

        <Link href="/portal">
          <Button size="lg">
            Enter Platform
          </Button>
        </Link>

      </div>

    </div>
  );
}