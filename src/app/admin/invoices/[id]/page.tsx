"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


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


export default function InvoicePage() {

  const router = useRouter();

  const params = useParams();

  const id = params.id as string;


  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    async function loadInvoice() {

      try {

        const response =
          await fetch(
            `/api/admin/invoices/${id}`
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
            "Failed loading invoice"
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


      } finally {

        setLoading(false);

      }

    }


    if (id) {

      loadInvoice();

    }

  }, [id, router]);


  if (loading) {

    return (

      <main className="min-h-screen pt-32 px-10 text-gray-900">

        <p>
          Loading invoice...
        </p>

      </main>

    );

  }


  if (!invoice) {

    return (

      <main className="min-h-screen pt-32 px-10 text-gray-900">

        <h1 className="text-2xl font-bold">
          Invoice not found
        </h1>

        <button
          onClick={() =>
            router.push(
              "/admin/invoices"
            )
          }
          className="mt-6 rounded bg-black px-4 py-2 text-white"
        >
          Back to Invoices
        </button>

      </main>

    );

  }


  return (

    <main className="min-h-screen bg-gray-100 pt-32 px-6 pb-12">

      <div className="max-w-4xl mx-auto">


        <button
          onClick={() =>
            router.push(
              "/admin/invoices"
            )
          }
          className="mb-6 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          ← Back to Invoices
        </button>


        <div className="bg-white rounded-xl shadow-sm border p-8">


          <div className="flex justify-between gap-8 border-b pb-6">

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
                Invoice
              </p>

              <p className="font-semibold text-gray-900">
                {invoice.invoiceNumber}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Billing Period
              </p>

              <p className="font-semibold text-gray-900">
                {invoice.billingPeriod}
              </p>

            </div>

          </div>


          <div className="mt-8">

            <p className="text-sm text-gray-500">
              Bill To
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {invoice.companyName}
            </h2>

            <p className="text-gray-700">
              {invoice.contactName}
            </p>

            <p className="text-gray-700">
              {invoice.email}
            </p>

          </div>


          <div className="mt-8">

            <h2 className="text-lg font-bold text-gray-900">
              Usage
            </h2>


            <div className="mt-4 overflow-hidden rounded-lg border">

              <div className="grid grid-cols-4 bg-gray-50 p-4 text-sm font-semibold text-gray-600">

                <div>
                  Description
                </div>

                <div>
                  Messages
                </div>

                <div>
                  Price / Message
                </div>

                <div className="text-right">
                  Amount
                </div>

              </div>


              <div className="grid grid-cols-4 p-4 text-gray-900">

                <div>
                  AI Message Usage
                </div>

                <div>
                  {invoice.messages}
                </div>

                <div>
                  R
                  {invoice.pricePerMessage.toFixed(
                    2
                  )}
                </div>

                <div className="text-right">
                  R
                  {invoice.usageAmount.toFixed(
                    2
                  )}
                </div>

              </div>

            </div>

          </div>


          <div className="mt-8 ml-auto max-w-sm space-y-3">


            <div className="flex justify-between text-gray-700">

              <span>
                Monthly Fee
              </span>

              <span>
                R
                {invoice.monthlyFee.toFixed(
                  2
                )}
              </span>

            </div>


            <div className="flex justify-between text-gray-700">

              <span>
                Usage
              </span>

              <span>
                R
                {invoice.usageAmount.toFixed(
                  2
                )}
              </span>

            </div>


            <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">

              <span>
                Total
              </span>

              <span>
                R
                {invoice.totalAmount.toFixed(
                  2
                )}
              </span>

            </div>

          </div>


          <div className="mt-8 border-t pt-6 grid md:grid-cols-2 gap-6">


            <div>

              <p className="text-sm text-gray-500">
                Payment Status
              </p>

              <p className="mt-1 font-semibold text-yellow-700">
                {invoice.paymentStatus}
              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">
                Due Date
              </p>

              <p className="mt-1 font-semibold text-gray-900">

                {invoice.dueDate
                  ? new Date(
                      invoice.dueDate
                    ).toLocaleDateString(
                      "en-ZA",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Not set"}

              </p>

            </div>


          </div>


          <div className="mt-8 border-t pt-6 text-sm text-gray-500">

            Invoice created{" "}

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


        </div>

      </div>

    </main>

  );

}