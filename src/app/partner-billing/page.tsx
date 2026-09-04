"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type PartnerBillingData = {
   _id: string;
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
  extraMessages: number;
  extraUsageCharge: number;
  status: string;
  subscriptionStatus: string;
  paymentStatus: string;
  nextBillingDate: string | null;
  currentBill: number;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        plan?: string;
        currency?: string;
        amount?: number;
        reference?: string;
        metadata?: Record<string, unknown>;
        callback?: (response: {
          reference?: string;
          status?: string;
          message?: string;
        }) => void;
        onClose?: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}
export default function PartnerBilling() {
  const router = useRouter();

  const [partner, setPartner] =
    useState<PartnerBillingData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  // ==========================================
  // LOAD PARTNER BILLING INFORMATION
  // ==========================================

  const loadBilling = async () => {
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
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadBilling();
  }, [router]);
  // ==========================================
  // TEST EXTRA USAGE PAYMENT
  //
  // PREVIEW ONLY
  // This creates a Paystack TEST transaction
  // for the partner's current extra usage.
  // It does NOT mark the usage as billed.
  // ==========================================

    const handleTestExtraUsagePayment = async () => {
    try {
      setPaymentLoading(true);

      const token =
        localStorage.getItem("partnerToken");

      if (!token) {
        router.push("/partner-login");
        return;
      }

      if (!partner) {
        throw new Error(
          "Partner information is not available."
        );
      }

      // ==========================================
      // INITIALIZE TEST EXTRA-USAGE PAYMENT
      // ==========================================

      const response =
        await fetch(
          "/api/partner/payments/test-extra-usage",
          {
            method: "POST",

            headers: {
              Authorization: token,
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              partnerId:
                partner._id,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "PAYSTACK TEST EXTRA-USAGE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to initialize test payment."
        );
      }

      if (!data.accessCode) {
        throw new Error(
          "Paystack did not return an access code."
        );
      }

      // ==========================================
      // CHECK PAYSTACK SCRIPT
      // ==========================================

      if (!window.PaystackPop) {
        throw new Error(
          "Paystack is still loading. Please try again."
        );
      }

      const PaystackPop =
        window.PaystackPop;

      // ==========================================
      // OPEN PAYSTACK TEST CHECKOUT
      // ==========================================

      const handler =
        PaystackPop.setup({
          key:
            process.env
              .NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",

          email:
            partner.email,

          amount:
            data.amount,

          currency:
            data.currency,

          reference:
            data.reference,

          metadata: {
            partnerId:
              partner._id,

            paymentType:
              "partner_extra_usage_test",

            extraMessages:
              data.extraMessages,

            extraUsageCharge:
              data.extraUsageCharge,
          },

                           callback: function (
            paymentResponse
          ) {
            console.log(
              "PAYSTACK TEST PAYMENT RESPONSE:",
              paymentResponse
            );

            const paymentReference =
              paymentResponse.reference ||
              data.reference;

            // ==========================================
            // VERIFY TEST PAYMENT
            // ==========================================

            fetch(
              "/api/partner/payments/test-extra-usage/verify",
              {
                method: "POST",

                headers: {
                  Authorization: token,
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
  reference:
    paymentReference,

  initializationReference:
    data.reference,
}),
              }
            )
              .then(
                async (
                  verifyResponse
                ) => {
                  const verifyData =
                    await verifyResponse.json();

                  console.log(
                    "PAYSTACK TEST EXTRA-USAGE VERIFICATION:",
                    verifyData
                  );

                  if (!verifyResponse.ok) {
                    throw new Error(
                      verifyData.error ||
                        "Test payment could not be verified."
                    );
                  }

                  // ==========================================
                  // PAYMENT SUCCESSFULLY RECORDED
                  // ==========================================

                  alert(
                    "Test payment successful and recorded. Your extra usage billing has been updated."
                  );

                  // ==========================================
                  // REFRESH BILLING INFORMATION
                  // ==========================================

                  await loadBilling();
                }
              )
              .catch(
                (error) => {
                  console.error(
                    "TEST EXTRA-USAGE PAYMENT VERIFICATION FAILED:",
                    error
                  );

                  alert(
                    error instanceof Error
                      ? error.message
                      : "Payment was completed but could not be recorded."
                  );
                }
              )
              .finally(
                () => {
                  setPaymentLoading(false);
                }
              );
          },

          onClose: function () {
            console.log(
              "PAYSTACK TEST CHECKOUT CLOSED"
            );

            setPaymentLoading(false);
          },

          
        });

      handler.openIframe();

    } catch (error) {
      console.error(
        "Paystack TEST extra usage payment failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start test payment."
      );

      setPaymentLoading(false);
    }
  };
      
  // ==========================================
  // INITIAL PAYMENT
  // ==========================================

  const handleInitialPayment = async () => {
    try {
      setPaymentLoading(true);

      const token =
        localStorage.getItem("partnerToken");

      if (!token) {
        router.push("/partner-login");
        return;
      }

      if (!partner) {
        throw new Error(
          "Partner information is not available."
        );
      }

      // ==========================================
      // INITIALIZE PAYMENT
      // ==========================================

      const response =
        await fetch(
          "/api/partner/payments/initialize",
          {
            method: "POST",

            headers: {
              Authorization: token,
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to initialize payment"
        );
      }

      if (!data.accessCode) {
        throw new Error(
          "Paystack did not return an access code."
        );
      }

      if (!data.reference) {
        throw new Error(
          "Paystack did not return a payment reference."
        );
      }

      // ==========================================
      // CHECK PAYSTACK SCRIPT
      // ==========================================

      if (!window.PaystackPop) {
        throw new Error(
          "Paystack is still loading. Please try again."
        );
      }

      const PaystackPop =
        window.PaystackPop;


      // ==========================================
      // VERIFY PAYMENT AFTER PAYSTACK SUCCESS
      // ==========================================

      const verifyPayment = async (
        paymentReference: string
      ) => {
        try {
          console.log(
            "VERIFYING PARTNER PAYMENT:",
            paymentReference
          );

          const verifyResponse =
            await fetch(
              "/api/partner/payments/verify",
              {
                method: "POST",

                headers: {
                  Authorization: token,
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
  reference:
    paymentReference,

  initializationReference:
    data.reference,
}),
              }
            );

          const verifyData =
            await verifyResponse.json();

          console.log(
            "PARTNER PAYMENT VERIFICATION RESPONSE:",
            verifyData
          );

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.error ||
                "Payment verification failed."
            );
          }

          if (
            verifyData.subscriptionStatus !==
            "active"
          ) {
            throw new Error(
              "Payment was received, but the subscription could not be activated."
            );
          }

          // ==========================================
          // PAYMENT SUCCESSFULLY VERIFIED
          // ==========================================

          alert(
            "Payment successful! Your partner subscription is now active."
          );

          // Reload billing information
          await loadBilling();

          setPaymentLoading(false);

        } catch (error) {
          console.error(
            "Partner payment verification failed:",
            error
          );

          alert(
            error instanceof Error
              ? error.message
              : "Payment was received but could not be verified."
          );

          setPaymentLoading(false);
        }
      };

            // ==========================================
      // OPEN PAYSTACK
      // ==========================================

      const paystackKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (!paystackKey) {
        throw new Error(
          "Payment system not configured correctly."
        );
      }

           const handler =
        PaystackPop.setup({
          key: paystackKey,

          email: partner.email,

          plan:
            data.paystackPlanCode ||
            undefined,

          currency: data.currency,

          metadata: {
            partnerId:
              partner._id,
            plan:
              data.plan,
            paymentType:
              "partner_subscription",
          },

          callback: function (
            paymentResponse
          ) {
            verifyPayment(
              paymentResponse.reference ||
                data.reference
            );
          },

          onClose: function () {
            console.log(
              "PAYSTACK CHECKOUT CLOSED"
            );

            setPaymentLoading(false);
          },
        });

      handler.openIframe();

    } catch (error) {
      console.error(
        "Partner payment failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setPaymentLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

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

      const subscriptionIsActive =
  partner.subscriptionStatus === "active" ||
  partner.paymentStatus === "paid";

  return (
    <>
      <Script
  src="https://js.paystack.co/v1/inline.js"
  strategy="afterInteractive"
/>

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
                  Included Messages
                </p>

                <p className="text-gray-900 font-semibold">
                  {partner.includedMessages !== null
                    ? partner.includedMessages.toLocaleString()
                    : "Custom"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Extra Messages
                </p>

                <p className="text-gray-900 font-semibold">
                  {partner.extraMessages.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Extra Usage Charge
                </p>

                <p className="text-gray-900 font-semibold">
                  {currencySymbol}
                  {partner.extraUsageCharge.toFixed(2)}
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

            <div className="mt-6 flex flex-wrap gap-3">

                {process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" && (
  <button
    onClick={handleTestExtraUsagePayment}
    disabled={paymentLoading}
    className="bg-yellow-500 text-white px-5 py-3 rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {paymentLoading
      ? "Processing Test..."
      : "TEST Extra Usage Payment"}
  </button>
)}
              <button
                onClick={
                  handleInitialPayment
                }
                disabled={
  paymentLoading ||
  subscriptionIsActive
}
                className="bg-green-600 text-white px-5 py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading
  ? "Processing Payment..."
  : subscriptionIsActive
    ? "Subscription Active"
    : `Pay ${currencySymbol}${partner.monthlyFee ?? 0}`}
              </button>

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
    </>
  );
}