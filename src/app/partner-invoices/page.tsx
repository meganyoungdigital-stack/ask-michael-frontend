"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  _id: string;
  invoiceNumber: string;
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

export default function PartnerInvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      try {
        const partnerToken =
          localStorage.getItem("partnerToken");

        if (!partnerToken) {
          router.push("/partner-login");
          return;
        }

        const response = await fetch(
          "/api/partner/invoices",
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

        if (!response.ok) {
          throw new Error(
            "Failed to load invoices"
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error(
          "Failed loading invoices:",
          error
        );

        setError(
          "Unable to load your invoices."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [router]);

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
          Loading invoices...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-40 px-10 pb-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-3 mb-8">

          <button
            onClick={() =>
              router.push("/partner-billing")
            }
            className="text-gray-700 hover:text-black text-2xl"
          >
            ←
          </button>

          <h1 className="text-4xl font-bold text-gray-900">
            My Invoices
          </h1>

        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-xl font-bold text-gray-900">
              No invoices yet
            </h2>

            <p className="mt-2 text-gray-600">
              Your invoices will appear here once
              they have been generated.
            </p>

          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="p-6 border-b">

              <h2 className="text-xl font-bold text-gray-900">
                Invoice History
              </h2>

              <p className="mt-1 text-gray-600">
                View all of your current and previous
                invoices, including paid invoices.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Invoice
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Billing Period
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Due Date
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Created
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {invoices.map((invoice) => (

                    <tr
                      key={invoice._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {invoice.billingPeriod}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatCurrency(
                          invoice.totalAmount
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                            invoice.paymentStatus
                          )}`}
                        >
                          {invoice.paymentStatus}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(
                          invoice.dueDate
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(
                          invoice.createdAt
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}