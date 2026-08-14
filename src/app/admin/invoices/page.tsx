"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type Invoice = {

  _id: string;

  invoiceNumber: string;

  partnerId: string;

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


export default function AdminInvoicesPage() {

  const router = useRouter();

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    async function loadInvoices() {

      try {

        const response =
          await fetch(
            "/api/admin/invoices"
          );


        if (
          response.status === 401
        ) {

          router.push(
            "/admin-login"
          );

          return;

        }


        if (!response.ok) {

          throw new Error(
            "Failed loading invoices"
          );

        }


        const data =
          await response.json();


        if (
          Array.isArray(data)
        ) {

          setInvoices(data);

        } else {

          setInvoices([]);

        }


      } catch (error) {

        console.error(
          "Failed loading invoices:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadInvoices();

  }, [router]);


  if (loading) {

    return (

      <main className="min-h-screen pt-32 px-10 text-gray-900">

        <p>
          Loading invoices...
        </p>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-gray-50 pt-32 px-10 pb-10">

      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Invoices
      </h1>


      {invoices.length === 0 ? (

        <div className="bg-white rounded-xl border p-6 text-gray-900">

          No invoices found.

        </div>

      ) : (

        <div className="space-y-6">

          {invoices.map(
            (invoice) => (

              <div
                key={invoice._id}
                className="bg-white rounded-xl border p-6"
              >

                <div className="flex justify-between gap-6">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">

                      {invoice.companyName}

                    </h2>

                    <p className="text-gray-700 mt-1">

                      {invoice.email}

                    </p>

                  </div>


                  <div>

                    <span className="rounded px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700">

                      {invoice.paymentStatus}

                    </span>

                  </div>

                </div>


                <div className="mt-5 grid md:grid-cols-3 gap-4">


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Invoice
                    </p>

                    <p className="font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Billing Period
                    </p>

                    <p className="font-semibold text-gray-900">
                      {invoice.billingPeriod}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Messages
                    </p>

                    <p className="font-semibold text-gray-900">
                      {invoice.messages}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Usage
                    </p>

                    <p className="font-semibold text-gray-900">
                      R{invoice.usageAmount.toFixed(2)}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Monthly Fee
                    </p>

                    <p className="font-semibold text-gray-900">
                      R{invoice.monthlyFee.toFixed(2)}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      R{invoice.totalAmount.toFixed(2)}
                    </p>

                  </div>


                </div>


                <div className="mt-5 text-sm text-gray-600">

                  Created:{" "}

                  {new Date(
                    invoice.createdAt
                  ).toLocaleDateString(
                    "en-ZA",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}

                </div>
<div className="mt-5">

  <button
    onClick={() =>
      router.push(
        `/admin/invoices/${invoice._id}`
      )
    }
    className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
  >
    View Invoice
  </button>

</div>

              </div>

            )
          )}

        </div>

      )}

    </main>

  );

}