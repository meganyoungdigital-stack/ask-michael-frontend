"use client";

import { useEffect, useState } from "react";
import type {
  PartnerPlan,
  PartnerCurrency,
} from "@/lib/partnerPlans";


type PartnerAccount = {
  _id: string;

  companyName: string;

  contactName: string;

  email: string;

  apiKey: string;

  testApiKey: string;

  messages: number;

  monthlyFee: number;

  pricePerMessage: number;

  plan: PartnerPlan;

  currency: PartnerCurrency;

  includedMessages: number | null;

  maxUsers: number | null;

  maxMessages: number | null;

    status: string;

  createdAt: string;

  termsAccepted: boolean;

  termsVersion: string;

  termsAcceptedAt: string | null;
};

 type PartnerApplication = {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string;
  message: string;
  status: string;
  createdAt: string;
};
export default function PartnersAdminPage() {


 const [applications, setApplications] = useState<PartnerAccount[]>([]);
  const [updating, setUpdating] = useState("");
  const [loading, setLoading] = useState(true);
const [generatingInvoice, setGeneratingInvoice] = useState("");



const [partnerSearch, setPartnerSearch] = useState("");
const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);

const [pendingApplications, setPendingApplications] =
  useState<PartnerApplication[]>([]);

const [loadingApplications, setLoadingApplications] =
  useState(true);

const [selectedApplicationId, setSelectedApplicationId] =
  useState<string | null>(null);

const [approvalPlan, setApprovalPlan] =
  useState<PartnerPlan>("starter");

const [approvalCurrency, setApprovalCurrency] =
  useState<PartnerCurrency>("ZAR");

const [approvalMonthlyFee, setApprovalMonthlyFee] =
  useState<number>(0);

const [approvalIncludedMessages, setApprovalIncludedMessages] =
  useState<number>(0);

const [approvalPricePerMessage, setApprovalPricePerMessage] =
  useState<number>(0);

const [approvalMaxUsers, setApprovalMaxUsers] =
  useState<number>(1);

const [approvalMaxMessages, setApprovalMaxMessages] =
  useState<number>(0);

  function handleLogout() {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin-login";
}


   useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/admin/accounts");

        if (response.status === 401) {
          window.location.href = "/admin-login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load partner accounts");
        }

        const data = await response.json();

        console.log("Partner accounts:", data);

        console.log("FIRST PARTNER TERMS:", data[0]?.termsAccepted);
console.log("FIRST PARTNER TERMS VERSION:", data[0]?.termsVersion);
console.log("FIRST PARTNER TERMS ACCEPTED AT:", data[0]?.termsAcceptedAt);

console.log(
  "Terms data:",
  data.map((partner: PartnerAccount) => ({
    companyName: partner.companyName,
    termsAccepted: partner.termsAccepted,
    termsVersion: partner.termsVersion,
    termsAcceptedAt: partner.termsAcceptedAt,
  }))
);

        if (Array.isArray(data)) {
          setApplications(data);
        } else {
          console.error("Unexpected API response:", data);
          setApplications([]);
        }
      } catch (error) {
        console.error("Failed loading partners:", error);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  useEffect(() => {
  async function loadPendingApplications() {
    try {
      const response = await fetch(
        "/api/admin/partners"
      );

      if (response.status === 401) {
        window.location.href = "/admin-login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load partner applications"
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPendingApplications(
          data.filter(
            (application: PartnerApplication) =>
              application.status === "pending"
          )
        );
      } else {
        console.error(
          "Unexpected applications response:",
          data
        );

        setPendingApplications([]);
      }

    } catch (error) {
      console.error(
        "Failed loading partner applications:",
        error
      );

    } finally {
      setLoadingApplications(false);
    }
  }

  loadPendingApplications();
}, []);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-10 text-gray-900">
        <p>Loading partner applications...</p>
      </main>
    );
   }

   async function updateApplicationStatus(
  id: string,
  status: string
) {
  try {
    setUpdating(id);

    const response = await fetch(
      "/api/admin/partners",
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
  id,
  status,

  plan: approvalPlan,

  currency: approvalCurrency,

  ...(approvalPlan === "enterprise"
    ? {
        monthlyFee: approvalMonthlyFee,

        includedMessages:
          approvalIncludedMessages,

        pricePerMessage:
          approvalPricePerMessage,

        maxUsers: approvalMaxUsers,

        maxMessages:
          approvalMaxMessages,
      }
    : {}),
}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Failed to update application"
      );
    }

    setPendingApplications((current) =>
      current.filter(
        (application) =>
          application._id !== id
      )
    );

  } catch (error) {

    console.error(
      "Partner application update failed:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to update application."
    );

  } finally {
    setUpdating("");
  }
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

async function deleteApplication(
  id: string
) {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this partner application?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setUpdating(id);

    const response = await fetch(
      "/api/admin/partners",
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Failed to delete application"
      );
    }

    setPendingApplications((current) =>
      current.filter(
        (application) =>
          application._id !== id
      )
    );

  } catch (error) {

    console.error(
      "Partner application delete failed:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete application."
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

const filteredApplications = applications.filter((partner) => {
  const search = partnerSearch.toLowerCase().trim();

  if (!search) {
    return true;
  }

  return (
    partner.companyName.toLowerCase().includes(search) ||
    partner.contactName.toLowerCase().includes(search) ||
    partner.email.toLowerCase().includes(search)
  );
});

async function generateInvoice(
  partner: PartnerAccount
) {

  try {

    setGeneratingInvoice(
      partner._id
    );


    const usageAmount =
      partner.messages *
      partner.pricePerMessage;


    const totalAmount =
      usageAmount +
      partner.monthlyFee;


    const now =
      new Date();


    const billingPeriod =
      now.toLocaleDateString(
        "en-ZA",
        {
          month: "long",
          year: "numeric",
        }
      );


    const dueDate =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();


    const response =
      await fetch(
        "/api/admin/invoices",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            partnerId:
              partner._id,

            companyName:
              partner.companyName,

            contactName:
              partner.contactName,

            email:
              partner.email,

            billingPeriod,

            messages:
              partner.messages,

            pricePerMessage:
              partner.pricePerMessage,

            monthlyFee:
              partner.monthlyFee,

            usageAmount,

            totalAmount,

            dueDate,

          }),

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Failed to generate invoice"
      );

    }


    alert(
      `Invoice ${data.invoice.invoiceNumber} created successfully.`
    );


  } catch (error) {

    console.error(
      "Invoice generation failed:",
      error
    );


    alert(
      "Failed to generate invoice."
    );


    } finally {
    setGeneratingInvoice("");
  }
}

async function viewLatestInvoice(
  partnerId: string
) {

  try {

    const response =
      await fetch(
        "/api/admin/invoices"
      );


    if (
      response.status === 401
    ) {

      window.location.href =
        "/admin-login";



      return;

    }


    if (!response.ok) {

      throw new Error(
        "Failed loading invoices"
      );

    }


    const invoices =
      await response.json();


    const partnerInvoices =
      invoices.filter(
        (invoice: {
          partnerId: string;
        }) =>
          invoice.partnerId ===
          partnerId
      );


    if (
      partnerInvoices.length === 0
    ) {

      alert(
        "No invoices have been created for this partner yet."
      );

      return;

    }


    const latestInvoice =
      partnerInvoices[0];


    window.location.href =
      `/admin/invoices/${latestInvoice._id}`;


  } catch (error) {

    console.error(
      "Failed loading latest invoice:",
      error
    );


    alert(
      "Failed to load the latest invoice."
    );

  }

}

async function generateTestApiKey(
  partnerId: string
) {

  try {

    setUpdating(partnerId);

    const response =
      await fetch(
        "/api/admin/partners/generate-test-api-key",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            partnerId,
          }),

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Failed to generate test API key"
      );

    }


    setApplications((current) =>
      current.map((partner) =>
        partner._id === partnerId
          ? {
              ...partner,
              testApiKey:
                data.testApiKey,
            }
          : partner
      )
    );


  } catch (error) {

    console.error(
      "Test API key generation failed:",
      error
    );

    alert(
      "Failed to generate test API key."
    );


  } finally {

    setUpdating("");

  }

}
 
    return (
    <main className="min-h-screen bg-gray-50 pt-32 px-10 pb-10">

  <div className="mb-10">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">
      Pending Partner Applications
    </h2>

    {loadingApplications ? (
      <div className="bg-white rounded-xl border p-6 text-gray-700">
        Loading applications...
      </div>
    ) : pendingApplications.length === 0 ? (
      <div className="bg-white rounded-xl border p-6 text-gray-700">
        No pending partner applications.
      </div>
    ) : (
      <div className="space-y-6">
        {pendingApplications.map(
          (application) => (
            <div
              key={application._id}
              className="bg-white rounded-xl border p-6"
            >
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {application.companyName}
                  </h3>

                  <p className="text-gray-700 mt-1">
                    {application.contactName}
                  </p>

                  <p className="text-gray-700">
                    {application.email}
                  </p>

                  {application.website && (
                    <p className="text-gray-700 mt-1">
                      {application.website}
                    </p>
                  )}

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-500">
                      Application Message
                    </p>

                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                      {application.message}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Applied:{" "}
                    {new Date(
                      application.createdAt
                    ).toLocaleString("en-ZA")}
                  </p>
                </div>

                              <div>
                <span className="rounded px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700">
                  {application.status}
                </span>
              </div>
            </div>

                        <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Partner Plan
                </h4>

                {selectedApplicationId !== application._id && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedApplicationId(
                        application._id
                      )
                    }
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Configure Plan
                  </button>
                )}
              </div>

              {selectedApplicationId === application._id && (
                <div className="mt-4">

                  <div className="grid md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan
                      </label>

                      <select
                        value={approvalPlan}
                        onChange={(event) =>
                          setApprovalPlan(
                            event.target.value as PartnerPlan
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      >
                        <option value="starter">
                          Starter
                        </option>

                        <option value="business">
                          Business
                        </option>

                        <option value="enterprise">
                          Enterprise
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>

                      <select
                        value={approvalCurrency}
                        onChange={(event) =>
                          setApprovalCurrency(
                            event.target.value as PartnerCurrency
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      >
                        <option value="ZAR">
                          ZAR
                        </option>

                        <option value="USD">
                          USD
                        </option>
                      </select>
                    </div>

                  </div>

                  {approvalPlan === "enterprise" && (
                    <div className="mt-6 border-t pt-6">

                      <h5 className="text-md font-semibold text-gray-900 mb-4">
                        Enterprise Pricing
                      </h5>

                      <div className="grid md:grid-cols-2 gap-4">

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Fee
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={approvalMonthlyFee}
                            onChange={(event) =>
                              setApprovalMonthlyFee(
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Included Messages
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={approvalIncludedMessages}
                            onChange={(event) =>
                              setApprovalIncludedMessages(
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price Per Message
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={approvalPricePerMessage}
                            onChange={(event) =>
                              setApprovalPricePerMessage(
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Users
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={approvalMaxUsers}
                            onChange={(event) =>
                              setApprovalMaxUsers(
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Messages
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={approvalMaxMessages}
                            onChange={(event) =>
                              setApprovalMaxMessages(
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                          />
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={() =>
                    updateApplicationStatus(
                      application._id,
                      "approved"
                    )
                  }
                  disabled={
                    updating === application._id
                  }
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {updating === application._id
                    ? "Processing..."
                    : "Approve"}
                </button>

                <button
                  onClick={() =>
                    updateApplicationStatus(
                      application._id,
                      "rejected"
                    )
                  }
                  disabled={
                    updating === application._id
                  }
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {updating === application._id
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  onClick={() =>
                    deleteApplication(
                      application._id
                    )
                  }
                  disabled={
                    updating === application._id
                  }
                  className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {updating === application._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    )}
  </div>

  <div className="flex items-center justify-between mb-8">

  <h1 className="text-4xl font-bold text-gray-900">
    Partner Accounts
  </h1>

  <button
    onClick={handleLogout}
    className="rounded bg-gray-900 px-5 py-2 text-white hover:bg-gray-700"
  >
    Logout
  </button>

</div>

    <div className="space-y-6">

  {applications
    .filter((partner) => {
      const search =
        partnerSearch.trim().toLowerCase();

      if (!search) {
        return true;
      }

      return (
        partner.companyName
          .toLowerCase()
          .includes(search) ||
        partner.contactName
          .toLowerCase()
          .includes(search) ||
        partner.email
          .toLowerCase()
          .includes(search)
      );
    })
    .map((partner) => {

      const isExpanded =
        expandedPartnerId === partner._id;

      return (
        <div
          key={partner._id}
          className="bg-white rounded-xl border shadow-sm overflow-hidden"
        >

          {/* PARTNER SUMMARY */}

          <button
            type="button"
            onClick={() =>
              setExpandedPartnerId(
                isExpanded
                  ? null
                  : partner._id
              )
            }
            className="w-full text-left p-6 hover:bg-gray-50 transition"
          >

            <div className="flex items-center justify-between gap-6">

              <div className="flex-1">

                <h2 className="text-xl font-bold text-gray-900">
                  {partner.companyName}
                </h2>

                <p className="text-gray-700 mt-1">
                  {partner.contactName}
                </p>

                <p className="text-gray-600 text-sm">
                  {partner.email}
                </p>

              </div>

              <div className="flex items-center gap-4">

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

                <span className="text-2xl text-gray-500">
                  {isExpanded ? "▲" : "▼"}
                </span>

              </div>

            </div>

          </button>


          {/* EXPANDED DETAILS */}

          {isExpanded && (
            <div className="border-t bg-gray-50 p-6">

              {/* PLAN AND BILLING */}

              <div className="mb-6">

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Partner Plan & Billing
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Plan
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.plan || "Not assigned"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Currency
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.currency || "ZAR"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Messages Used
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.messages}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Monthly Fee
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.currency || "ZAR"}{" "}
                      {Number(
                        partner.monthlyFee || 0
                      ).toFixed(2)}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Price Per Message
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.currency || "ZAR"}{" "}
                      {Number(
                        partner.pricePerMessage || 0
                      ).toFixed(2)}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Included Messages
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.includedMessages ??
                        "Unlimited"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Maximum Users
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.maxUsers ??
                        "Unlimited"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Maximum Messages
                    </p>

                    <p className="text-xl font-semibold text-gray-900">
                      {partner.maxMessages ??
                        "Unlimited"}
                    </p>

                  </div>

                </div>

              </div>

              {/* TERMS AND CONDITIONS */}

              <div className="mb-6">

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Terms and Conditions
                </h3>

                <div className="grid md:grid-cols-3 gap-4">

                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Terms Accepted
                    </p>

                    <p
                      className={`text-xl font-semibold mt-1 ${
                        partner.termsAccepted
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {partner.termsAccepted
                        ? "Yes"
                        : "No"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Terms Version
                    </p>

                    <p className="text-xl font-semibold text-gray-900 mt-1">
                      {partner.termsVersion ||
                        "Not recorded"}
                    </p>

                  </div>


                  <div className="bg-white rounded-lg border p-4">

                    <p className="text-sm text-gray-500">
                      Accepted Date
                    </p>

                    <p className="text-xl font-semibold text-gray-900 mt-1">
                      {partner.termsAcceptedAt
                        ? new Date(
                            partner.termsAcceptedAt
                          ).toLocaleString("en-ZA")
                        : "Not recorded"}
                    </p>

                  </div>

                </div>

              </div>

              
              {/* API KEYS */}

              <div className="mb-6">

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  API Keys
                </h3>

                <div className="bg-white rounded-lg border p-4">

                  <p className="text-sm text-gray-500">
                    Live API Key
                  </p>

                  <p className="text-sm font-mono break-all text-gray-900 mt-1">
                    {partner.apiKey}
                  </p>


                  <p className="text-sm text-gray-500 mt-5">
                    Test API Key
                  </p>

                  <p className="text-sm font-mono break-all text-gray-900 mt-1">
                    {partner.testApiKey ||
                      "Test API key not generated"}
                  </p>

                </div>

              </div>


              {/* ACTION BUTTONS */}

              <div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Actions
                </h3>

                <div className="flex flex-wrap gap-4">

                  <button
                    onClick={() =>
                      updatePartnerStatus(
                        partner._id,
                        "active"
                      )
                    }
                    disabled={
                      updating === partner._id
                    }
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
                    disabled={
                      updating === partner._id
                    }
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
                    disabled={
                      updating === partner._id
                    }
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating === partner._id
                      ? "Updating..."
                      : "Reject"}
                  </button>


                  <button
                    onClick={() =>
                      deletePartner(
                        partner._id
                      )
                    }
                    disabled={
                      updating === partner._id
                    }
                    className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {updating === partner._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>


                  <button
                    onClick={() =>
                      generateInvoice(
                        partner
                      )
                    }
                    disabled={
                      generatingInvoice ===
                      partner._id
                    }
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingInvoice ===
                    partner._id
                      ? "Generating..."
                      : "Generate Invoice"}
                  </button>


                  <button
                    onClick={() =>
                      viewLatestInvoice(
                        partner._id
                      )
                    }
                    className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  >
                    View Latest Invoice
                  </button>


                  <button
                    onClick={() =>
                      generateTestApiKey(
                        partner._id
                      )
                    }
                    disabled={
                      !!partner.testApiKey
                    }
                    className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {partner.testApiKey
                      ? "Test API Key Generated"
                      : "Generate Test API Key"}
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>
      );

    })}

  {applications.length > 0 &&
    applications.filter((partner) => {
      const search =
        partnerSearch.trim().toLowerCase();

      if (!search) {
        return true;
      }

      return (
        partner.companyName
          .toLowerCase()
          .includes(search) ||
        partner.contactName
          .toLowerCase()
          .includes(search) ||
        partner.email
          .toLowerCase()
          .includes(search)
      );
    }).length === 0 && (
      <div className="bg-white rounded-xl border p-6 text-gray-900">
        No partners match your search.
      </div>
    )}

  {applications.length === 0 && (
    <div className="bg-white rounded-xl border p-6 text-gray-900">
      No partner accounts found.
    </div>
  )}

</div>

  </main>
);
}