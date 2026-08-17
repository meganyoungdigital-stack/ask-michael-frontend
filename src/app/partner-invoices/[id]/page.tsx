"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  billingPeriod: string;
  messages: number;
  pricePerMessage: number;
  monthlyFee: number;
  usageAmount: number;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string | null;
  createdAt: string;
};

export default function PartnerInvoicePage() {
  const router = useRouter();
  const params = useParams();

  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        const partnerToken =
          localStorage.getItem("partnerToken");

        if (!partnerToken) {
          router.push("/partner-login");
          return;
        }

        const invoiceId =
          params.id as string;

        const response = await fetch(
          `/api/partner/invoices/${invoiceId}`,
          {
            headers: {
              Authorization: partnerToken,
            },
          }
        );

        if (response.status === 401) {
          router.push("/partner-login");
          return;
        }

        if (response.status === 404) {
          setError("Invoice not found.");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load invoice"
          );
        }

        const data =
          await response.json();

        setInvoice(data);
      } catch (error) {
        console.error(
          "Failed loading invoice:",
          error
        );

        setError(
          "Unable to load this invoice."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [params.id, router]);

  function formatCurrency(amount: number) {
    return `R${amount.toFixed(2)}`;
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-40 px-10">
        <p className="text-gray-700">
          Loading invoice...
        </p>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-gray-50 pt-40 px-10">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() =>
              router.push("/partner-invoices")
            }
            className="text-gray-700 hover:text-black text-2xl"
          >
            ←
          </button>

          <div className="mt-8 bg-white rounded-xl shadow p-8">

            <h1 className="text-2xl font-bold text-gray-900">
              Invoice unavailable
            </h1>

            <p className="mt-2 text-gray-600">
              {error ||
                "This invoice could not be found."}
            </p>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-32 px-6 pb-10">

      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() =>
              router.push("/partner-invoices")
            }
            className="text-gray-700 hover:text-black text-2xl"
          >
            ←
          </button>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
              invoice.paymentStatus
            )}`}
          >
            {invoice.paymentStatus}
          </span>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-8 border-b">

            <div className="flex justify-between gap-6">

              <div>

                <h1 className="text-3xl font-bold text-gray-900">
                  Ask Michael AI
                </h1>

                <p className="mt-2 text-gray-600">
                  Monthly Invoice
                </p>

              </div>

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Invoice Number
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {invoice.invoiceNumber}
                </p>

              </div>

            </div>

          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">

            <div>

              <h2 className="text-sm font-semibold text-gray-500 uppercase">
                Billed To
              </h2>

              <p className="mt-2 font-bold text-gray-900">
                {invoice.companyName}
              </p>

              <p className="text-gray-700">
                {invoice.contactName}
              </p>

              <p className="text-gray-700">
                {invoice.email}
              </p>

            </div>

            <div>

              <h2 className="text-sm font-semibold text-gray-500 uppercase">
                Invoice Details
              </h2>

              <p className="mt-2 text-gray-700">
                Billing Period:{" "}
                <span className="font-semibold">
                  {invoice.billingPeriod}
                </span>
              </p>

              <p className="text-gray-700">
                Invoice Date:{" "}
                <span className="font-semibold">
                  {formatDate(invoice.createdAt)}
                </span>
              </p>

              <p className="text-gray-700">
                Due Date:{" "}
                <span className="font-semibold">
                  {formatDate(invoice.dueDate)}
                </span>
              </p>

            </div>

          </div>

          <div className="px-8 pb-8">

            <div className="border rounded-lg overflow-hidden">

              <div className="grid grid-cols-4 bg-gray-50 px-5 py-4 font-semibold text-gray-700">

                <span>Description</span>
                <span>Quantity</span>
                <span>Rate</span>
                <span className="text-right">
                  Amount
                </span>

              </div>

              <div className="grid grid-cols-4 px-5 py-5 border-t text-gray-700">

                <span>AI Message Usage</span>

                <span>
                  {invoice.messages}
                </span>

                <span>
                  {formatCurrency(
                    invoice.pricePerMessage
                  )}
                </span>

                <span className="text-right">
                  {formatCurrency(
                    invoice.usageAmount
                  )}
                </span>

              </div>

              <div className="grid grid-cols-4 px-5 py-5 border-t text-gray-700">

                <span>Monthly Subscription</span>

                <span>1</span>

                <span>
                  {formatCurrency(
                    invoice.monthlyFee
                  )}
                </span>

                <span className="text-right">
                  {formatCurrency(
                    invoice.monthlyFee
                  )}
                </span>

              </div>

            </div>

          </div>

          <div className="px-8 pb-8">

            <div className="ml-auto max-w-sm space-y-3">

              <div className="flex justify-between text-gray-700">

                <span>Usage</span>

                <span>
                  {formatCurrency(
                    invoice.usageAmount
                  )}
                </span>

              </div>

              <div className="flex justify-between text-gray-700">

                <span>Monthly Fee</span>

                <span>
                  {formatCurrency(
                    invoice.monthlyFee
                  )}
                </span>

              </div>

              <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">

                <span>Total</span>

                <span>
                  {formatCurrency(
                    invoice.totalAmount
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}