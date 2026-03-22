"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      stripePriceId: "price_free",
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
      stripePriceId: "price_pro",
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
      stripePriceId: "price_pro_plus",
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

  const handleCheckout = async (priceId: string) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  const Feature = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="w-5 h-5" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground" />
    );

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      {/* HERO */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-4"
        >
          Your AI Engineering Co-Pilot
        </motion.h1>
        <p className="text-lg text-muted-foreground">
          From standards to predictions to CAD — all in one platform
        </p>
      </div>

      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`p-6 rounded-2xl shadow-lg border ${
                plan.highlight ? "border-primary scale-105" : ""
              }`}
            >
              <CardContent>
                {plan.highlight && (
                  <div className="mb-2 text-sm font-semibold text-primary">
                    Most Popular
                  </div>
                )}

                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="text-4xl font-bold my-4">{plan.price}</p>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleCheckout(plan.stripePriceId)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* COMPARISON TABLE */}
      <div className="max-w-6xl mx-auto mt-24">
        <h3 className="text-3xl font-semibold text-center mb-10">
          Compare Plans
        </h3>

        <div className="grid grid-cols-4 gap-4 items-center text-center">
          <div></div>
          {plans.map((p) => (
            <div key={p.name} className="font-semibold">
              {p.name}
            </div>
          ))}

          <div className="text-left">AI Chat</div>
          {plans.map((p) => (
            <Feature key={p.name + "chat"} value={p.features.chat} />
          ))}

          <div className="text-left">Engineering RAG</div>
          {plans.map((p) => (
            <Feature key={p.name + "rag"} value={p.features.rag} />
          ))}

          <div className="text-left">Operational Intelligence</div>
          {plans.map((p) => (
            <Feature
              key={p.name + "int"}
              value={p.features.intelligence}
            />
          ))}

          <div className="text-left">CAD + Visual AI</div>
          {plans.map((p) => (
            <Feature key={p.name + "cad"} value={p.features.cad} />
          ))}

          <div className="text-left">Priority Compute</div>
          {plans.map((p) => (
            <Feature key={p.name + "pri"} value={p.features.priority} />
          ))}
        </div>
      </div>

      {/* ENTERPRISE */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <h3 className="text-3xl font-semibold mb-4">Enterprise</h3>
        <p className="text-muted-foreground mb-6">
          Custom deployments, private AI models, sensor integrations, and
          dedicated support.
        </p>
        <Button size="lg">Contact Sales</Button>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 rounded-2xl shadow">
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  “This AI replaced hours of engineering analysis every day.”
                </p>
                <div className="font-semibold">Engineering Lead</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FINAL CTA */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold mb-4">
          Start Using AI in Your Engineering Workflow
        </h3>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}
