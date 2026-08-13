"use client";

import { useEffect, useState } from "react";


type PartnerAccount = {

_id:string;

companyName:string;

contactName:string;

email:string;

apiKey:string;

messages:number;

monthlyFee:number;

pricePerMessage:number;

status:string;

subscriptionStatus:string;

paymentStatus:string;

createdAt:string;

};



export default function PartnersAdminPage() {


 const [applications, setApplications] = useState<PartnerAccount[]>([]);
  const [updating, setUpdating] = useState("");
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadApplications() {

      try {

        const response = await fetch("/api/admin/accounts")

if (!response.ok) {
  throw new Error("Failed to load partner applications");
}

const data = await response.json();

console.log("Partner applications:", data);

if (Array.isArray(data)) {
  setApplications(data);
} else {
  console.error("Unexpected API response:", data);
  setApplications([]);
}


      } catch (error) {

        console.error(
          "Failed loading partners:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadApplications();


  }, []);





  if (loading) {

  return (

    <main className="min-h-screen pt-32 px-10 text-gray-900">

      <p>
        Loading partner applications...
      </p>

    </main>

  );


   
    

  }




async function updatePartnerStatus(
  id: string,
  status: string
) {

  try {

    setUpdating(id);


    await fetch(
  "/api/admin/accounts",
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          status,
        }),

      }
    );


    setApplications((current) =>
      current.map((partner) =>
        partner._id === id
          ? {
              ...partner,
              status,
            }
          : partner
      )
    );


  } catch (error) {

    console.error(
      "Status update failed",
      error
    );

  } finally {

    setUpdating("");

  }

}
async function deletePartner(id: string) {

  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this partner application?"
  );

  if (!confirmed) {
    return;
  }

  try {

    setUpdating(id);

    const response = await fetch(
  "/api/admin/accounts",
      {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to delete partner application"
      );
    }

    setApplications((current) =>
      current.filter(
        (partner) =>
          partner._id !== id
      )
    );

  } catch (error) {

    console.error(
      "Delete failed:",
      error
    );

  } finally {

    setUpdating("");

  }

}
 return (
  <main className="min-h-screen bg-gray-50 pt-32 px-10 pb-10">

    <h1 className="text-4xl font-bold mb-8 text-gray-900">
      Partner Accounts
    </h1>

    <div className="space-y-6">

      {applications.length === 0 && (
        <div className="bg-white rounded-xl border p-6 text-gray-900">
          No partner accounts found.
        </div>
      )}

      {applications.map((partner) => (
        <div
          key={partner._id}
          className="bg-white rounded-xl border p-6"
        >

          <div className="flex justify-between gap-6">

            <div className="flex-1">

              <h2 className="text-xl font-bold text-gray-900">
                {partner.companyName}
              </h2>

              <p className="text-gray-700 mt-1">
                {partner.contactName}
              </p>

              <p className="text-gray-700">
                {partner.email}
              </p>


              <div className="mt-5 grid md:grid-cols-2 gap-4">

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Messages Used
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {partner.messages}
                  </p>
                </div>


                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Monthly Fee
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    R{partner.monthlyFee}
                  </p>
                </div>


                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Subscription
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {partner.subscriptionStatus}
                  </p>
                </div>


                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Payment
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {partner.paymentStatus}
                  </p>
                </div>


                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <p className="text-sm text-gray-500">
                    API Key
                  </p>

                  <p className="text-sm font-mono break-all text-gray-900">
                    {partner.apiKey}
                  </p>
                </div>

              </div>

            </div>


            <div>
              <span
                className={`rounded px-3 py-1 text-sm font-semibold ${
                  partner.status === "active"
                    ? "bg-green-100 text-green-700"
                    : partner.status === "suspended"
                    ? "bg-orange-100 text-orange-700"
                    : partner.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {partner.status}
              </span>
            </div>

          </div>


          <div className="mt-6 flex flex-wrap gap-4">

            <button
              onClick={() =>
                updatePartnerStatus(
                  partner._id,
                  "active"
                )
              }
              disabled={updating === partner._id}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {updating === partner._id
                ? "Updating..."
                : "Activate"}
            </button>


            <button
              onClick={() =>
                updatePartnerStatus(
                  partner._id,
                  "suspended"
                )
              }
              disabled={updating === partner._id}
              className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {updating === partner._id
                ? "Updating..."
                : "Suspend"}
            </button>


            <button
              onClick={() =>
                updatePartnerStatus(
                  partner._id,
                  "rejected"
                )
              }
              disabled={updating === partner._id}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {updating === partner._id
                ? "Updating..."
                : "Reject"}
            </button>


            <button
              onClick={() =>
                deletePartner(partner._id)
              }
              disabled={updating === partner._id}
              className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {updating === partner._id
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        </div>
      ))}

    </div>

  </main>
);
}