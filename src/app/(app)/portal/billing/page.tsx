"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BillingPage() {
  const { user } = useUser();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BILLING DATA ================= */
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch("/api/billing");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Billing fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center">Loading billing...</div>
    );
  }

  const tier = data?.tier || "free";
  const status = data?.subscriptionStatus || "inactive";
  const usage = data?.usage || { used: 0, limit: 0 };

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Billing</h1>

      {/* PLAN */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
        <p className="text-lg capitalize">{tier}</p>
        <p className="text-sm text-muted-foreground">
          Status: {status}
        </p>
      </div>

      {/* USAGE */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Usage</h2>
        <p>
          {usage.used} / {usage.limit} messages used
        </p>

        <div className="w-full bg-muted rounded-full h-3 mt-3">
          <div
            className="bg-primary h-3 rounded-full"
            style={{
              width: `${
                usage.limit
                  ? (usage.used / usage.limit) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <Link href="/pricing">
          <Button>Upgrade Plan</Button>
        </Link>

        {/* Future cancel button */}
        <Button variant="outline" disabled>
          Cancel Subscription (Coming Soon)
        </Button>
      </div>
    </div>
  );
}