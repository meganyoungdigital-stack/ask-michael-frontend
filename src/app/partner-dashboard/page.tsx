"use client";


import {useEffect,useState} from "react";
import { useRouter } from "next/navigation";


export default function PartnerDashboard(){
    const router = useRouter();


const [partner,setPartner]=useState<any>(null);


const [keyActionLoading, setKeyActionLoading] =
  useState<string | null>(null);

const [newApiKey, setNewApiKey] =
  useState<string | null>(null);

const [newApiKeyType, setNewApiKeyType] =
  useState<"live" | "test" | null>(null);

const [keyMessage, setKeyMessage] =
  useState<string | null>(null);

async function generateApiKey(
  type: "live" | "test"
) {
  setKeyActionLoading(`generate-${type}`);
  setKeyMessage(null);
  setNewApiKey(null);
  setNewApiKeyType(null);

  try {
    const response = await fetch(
      `/api/partner/api-keys/${type}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          `Failed generating ${type} API key`
      );
    }

    setNewApiKey(data.apiKey);
    setNewApiKeyType(type);
    setKeyMessage(
      `New ${type === "live" ? "Live" : "Test"} API key generated. Save it now — it will not be shown again.`
    );

    const dashboardResponse =
      await fetch("/api/partner/dashboard");

    if (dashboardResponse.ok) {
      const dashboardData =
        await dashboardResponse.json();

      setPartner(dashboardData);
    }
  } catch (error) {
    setKeyMessage(
      error instanceof Error
        ? error.message
        : "Failed generating API key"
    );
  } finally {
    setKeyActionLoading(null);
  }
}

async function revokeApiKey(
  type: "live" | "test"
) {
  setKeyActionLoading(`revoke-${type}`);
  setKeyMessage(null);
  setNewApiKey(null);
  setNewApiKeyType(null);

  try {
    const response = await fetch(
      `/api/partner/api-keys/${type}/revoke`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          `Failed revoking ${type} API key`
      );
    }

    setKeyMessage(
      `${type === "live" ? "Live" : "Test"} API key revoked.`
    );

    const dashboardResponse =
      await fetch("/api/partner/dashboard");

    if (dashboardResponse.ok) {
      const dashboardData =
        await dashboardResponse.json();

      setPartner(dashboardData);
    }
  } catch (error) {
    setKeyMessage(
      error instanceof Error
        ? error.message
        : "Failed revoking API key"
    );
  } finally {
    setKeyActionLoading(null);
  }
}

async function copyNewApiKey() {
  if (!newApiKey) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      newApiKey
    );

    setKeyMessage(
      "API key copied to clipboard."
    );
  } catch {
    setKeyMessage(
      "Unable to copy automatically. Please copy the key manually."
    );
  }
}


useEffect(()=>{


async function load(){

const response =
await fetch(
"/api/partner/dashboard"
);


const data =
await response.json();


console.log(
"Dashboard response:",
JSON.stringify(data, null, 2)
);


if(!response.ok){

throw new Error(
data.error || "Dashboard failed"
);

}


setPartner(data);



}


load();


},[]);



if(!partner){

return(

<div className="p-10 text-black">
Loading dashboard...
</div>

);

}



return(

<main className="min-h-screen bg-gray-50 pt-40 px-10 pb-10">


<h1 className="text-4xl font-bold text-gray-900">

Welcome {partner.companyName}

</h1>


<p className="mt-2 text-gray-600">

{partner.email}

</p>



<div className="mt-10 grid md:grid-cols-3 gap-6">


<div className="bg-white rounded-xl p-6 shadow">

<h2 className="text-gray-500">
Subscription
</h2>

<p className="text-2xl text-black mt-2">

{partner.subscriptionStatus}

</p>

</div>




<div className="bg-white rounded-xl p-6 shadow">

<h2 className="text-gray-500">
Monthly Fee
</h2>

<p className="text-3xl text-black">
  {partner.currency === "USD"
    ? "$"
    : partner.currency === "EUR"
    ? "€"
    : partner.currency === "GBP"
    ? "£"
    : "R"}
  {partner.monthlyFee}
</p>

</div>




<div className="bg-white rounded-xl p-6 shadow">

<h2 className="text-gray-500">
Messages Used
</h2>

<p className="text-3xl text-black">

{partner.messages}

</p>

</div>

<div className="bg-white rounded-xl p-6 shadow">

  <h2 className="text-gray-500">
    Plan
  </h2>

  <p className="text-2xl text-black mt-2 capitalize">
    {partner.plan || "Not assigned"}
  </p>

  <p className="text-sm text-gray-500 mt-2">
    Currency: {partner.currency || "Not assigned"}
  </p>

</div>


</div>





<div className="mt-8 bg-white rounded-xl p-6 shadow text-gray-700">

  <h2 className="text-xl font-bold text-black">
    API Access
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage the API keys used to connect your systems to Ask Michael.
    New keys are shown once only and replace the previous key.
  </p>

  {keyMessage && (
    <div className="mt-6 bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
      {keyMessage}
    </div>
  )}

  {newApiKey && (
    <div className="mt-6 border border-gray-300 rounded-lg p-5 bg-gray-50">

      <p className="text-sm font-semibold text-gray-700">
        New {newApiKeyType === "live" ? "Live" : "Test"} API Key
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Copy this key now. It will not be displayed again.
      </p>

      <div className="mt-4 bg-white border rounded-lg p-4 break-all font-mono text-sm text-black">
        {newApiKey}
      </div>

      <button
        onClick={copyNewApiKey}
        className="mt-4 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
      >
        Copy API Key
      </button>

    </div>
  )}

  <div className="mt-8">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div>
        <p className="font-semibold text-black">
          Live API Key
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {partner.hasApiKey
            ? "Live API key configured"
            : "Live API key not configured"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => generateApiKey("live")}
          disabled={keyActionLoading !== null}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {keyActionLoading === "generate-live"
            ? "Generating..."
            : "Generate New Live Key"}
        </button>

        {partner.hasApiKey && (
          <button
            onClick={() => revokeApiKey("live")}
            disabled={keyActionLoading !== null}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {keyActionLoading === "revoke-live"
              ? "Revoking..."
              : "Revoke Live Key"}
          </button>
        )}

      </div>

    </div>

  </div>

  <div className="mt-8 border-t pt-8">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div>
        <p className="font-semibold text-black">
          Test API Key
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {partner.hasTestApiKey
            ? "Test API key configured"
            : "Test API key not configured"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => generateApiKey("test")}
          disabled={keyActionLoading !== null}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {keyActionLoading === "generate-test"
            ? "Generating..."
            : "Generate New Test Key"}
        </button>

        {partner.hasTestApiKey && (
          <button
            onClick={() => revokeApiKey("test")}
            disabled={keyActionLoading !== null}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {keyActionLoading === "revoke-test"
              ? "Revoking..."
              : "Revoke Test Key"}
          </button>
        )}

      </div>

    </div>

  </div>

</div>


<div className="mt-8 bg-white rounded-xl p-6 shadow text-gray-700">

  <h2 className="text-xl font-bold text-black">
    Plan Limits
  </h2>

  <div className="mt-6 grid md:grid-cols-2 gap-4">

    <div>
      <p className="text-sm text-gray-500">
        Included Messages
      </p>

      <p className="text-xl font-semibold text-black">
        {partner.includedMessages ?? "Custom"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Maximum Messages
      </p>

      <p className="text-xl font-semibold text-black">
        {partner.maxMessages ?? "Custom"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Maximum Users
      </p>

      <p className="text-xl font-semibold text-black">
        {partner.maxUsers ?? "Custom"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Price Per Message
      </p>

      <p className="text-xl font-semibold text-black">
        {partner.pricePerMessage ?? "Custom"}
      </p>
    </div>

  </div>

</div>


<div className="mt-8 bg-white rounded-xl p-6 shadow text-gray-700">


<h2 className="text-xl font-bold text-black">

Billing

</h2>


<p className="mt-4 text-gray-700">
  Current Balance:

  <strong>
    {" "}
    {partner.currency === "USD"
      ? "$"
      : partner.currency === "EUR"
      ? "€"
      : partner.currency === "GBP"
      ? "£"
      : "R"}
    {partner.currentBill}
  </strong>
</p>


<p className="mt-2 text-gray-700">
  Price per message:

  <strong>
    {" "}
    {partner.currency === "USD"
      ? "$"
      : partner.currency === "EUR"
      ? "€"
      : partner.currency === "GBP"
      ? "£"
      : "R"}
    {partner.pricePerMessage}
  </strong>
</p>



<p className="mt-2 text-gray-700">

Next Billing:

<strong>

 {partner.nextBillingDate || "Not scheduled"}

</strong>

</p>



<div className="mt-6 flex gap-4">


<button

onClick={() =>
router.push("/partner-billing")
}

className="bg-green-600 text-white px-5 py-2 rounded"

>
Manage Subscription
</button>


<button

className="bg-red-600 text-white px-5 py-2 rounded"

>

Cancel Subscription

</button>


</div>


</div>




<div className="mt-8 bg-white rounded-xl p-6 shadow text-gray-700">


<h2 className="text-xl font-bold text-black">

Account Details

</h2>


<p className="mt-3">

Contact:
{partner.contactName}

</p>


<p>

Status:
{partner.status}

</p>


</div>




</main>

);


}