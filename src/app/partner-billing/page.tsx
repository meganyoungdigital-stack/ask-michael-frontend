"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PartnerBillingData = {
  companyName: string;
  email: string;
  plan: string | null;
  currency: string | null;
  monthlyFee: number | null;
  includedMessages: number | null;
  pricePerMessage: number | null;
  maxUsers: number | null;
  maxMessages: number | null;
  messages: number;
  status: string;
  subscriptionStatus: string;
  nextBillingDate: string | null;
  currentBill: number;
};

export default function PartnerBilling() {
  const router = useRouter();

  const [partner, setPartner] =
    useState<PartnerBillingData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadBilling() {
      try {
        const token =
          localStorage.getItem("partnerToken");

        if (!token) {
          router.push("/partner-login");
          return;
        }

        const response =
          await fetch(
            "/api/partner/dashboard",
            {
              headers: {
                Authorization: token,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed loading billing information"
          );
        }

        setPartner(data);
      } catch (error) {
        console.error(
          "Failed loading billing information:",
          error
        );

        router.push("/partner-login");
      } finally {
        setLoading(false);
      }
    }

    loadBilling();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-40 px-10">
        <p className="text-gray-900">
          Loading billing information...
        </p>
      </main>
    );
  }

  if (!partner) {
    return null;
  }

  const currency =
    partner.currency || "USD";

  const currencySymbol =
    currency === "ZAR"
      ? "R"
      : "$";

  const planName =
    partner.plan
      ? partner.plan.charAt(0).toUpperCase() +
        partner.plan.slice(1)
      : "Not configured";

  return (
    <main className="min-h-screen bg-gray-50 pt-40 px-10 pb-10">

      <div className="flex items-center gap-3">

        <button
          onClick={() =>
            router.push(
              "/partner-dashboard"
            )
          }
          className="text-gray-700 hover:text-black text-2xl"
        >
          ←
        </button>

        <h1 className="text-4xl font-bold text-gray-900">
          Manage Subscription
        </h1>

      </div>


      <div className="mt-8 grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl p-6 shadow">

          <h2 className="text-xl font-bold text-gray-900">
            Billing Summary
          </h2>

          <div className="mt-5 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Company
              </p>

              <p className="text-gray-900 font-semibold">
                {partner.companyName}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Billing Email
              </p>

              <p className="text-gray-900">
                {partner.email}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Currency
              </p>

              <p className="text-gray-900 font-semibold">
                {currency}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Current Messages Used
              </p>

              <p className="text-gray-900 font-semibold">
                {partner.messages}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Current Balance
              </p>

              <p className="text-gray-900 text-2xl font-bold">
                {currencySymbol}
                {partner.currentBill}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Next Billing Date
              </p>

              <p className="text-gray-900">
                {partner.nextBillingDate
                  ? new Date(
                      partner.nextBillingDate
                    ).toLocaleDateString(
                      "en-ZA"
                    )
                  : "Not scheduled"}
              </p>
            </div>

          </div>

        </div>


        <div className="bg-white rounded-xl p-6 shadow">

          <h2 className="text-xl font-bold text-gray-900">
            Subscription
          </h2>


          <div className="mt-5 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Plan
              </p>

              <p className="text-xl font-semibold text-gray-900">
                {planName}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Monthly Fee
              </p>

              <p className="text-xl font-semibold text-gray-900">
                {partner.monthlyFee !== null
                  ? `${currencySymbol}${partner.monthlyFee}`
                  : "Custom Pricing"}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Included Messages
              </p>

              <p className="text-gray-900">
                {partner.includedMessages !== null
                  ? partner.includedMessages.toLocaleString()
                  : "Custom"}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Price Per Message
              </p>

              <p className="text-gray-900">
                {partner.pricePerMessage !== null
                  ? `${currencySymbol}${partner.pricePerMessage}`
                  : "Custom"}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Maximum Users
              </p>

              <p className="text-gray-900">
                {partner.maxUsers !== null
                  ? partner.maxUsers
                  : "Custom"}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Maximum Messages
              </p>

              <p className="text-gray-900">
                {partner.maxMessages !== null
                  ? partner.maxMessages.toLocaleString()
                  : "Custom"}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="text-gray-900 font-semibold">
                {partner.subscriptionStatus}
              </p>
            </div>

          </div>


          <div className="mt-6 flex gap-3">

            <button
              className="bg-red-600 text-white px-5 py-3 rounded hover:bg-red-700"
            >
              Cancel Subscription
            </button>


            <button
              onClick={() =>
                router.push(
                  "/partner-invoices"
                )
              }
              className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700"
            >
              Invoices
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}