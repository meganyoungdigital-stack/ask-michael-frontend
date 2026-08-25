"use client";


import {useEffect,useState} from "react";
import { useRouter } from "next/navigation";


export default function PartnerDashboard(){
    const router = useRouter();


const [partner,setPartner]=useState<any>(null);



useEffect(()=>{


async function load(){


const token =
localStorage.getItem(
"partnerToken"
);



const response =
await fetch(
"/api/partner/dashboard",
{
headers:{
Authorization:
token || ""
}
}
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

  <div className="mt-6">

    <p className="text-gray-600">
      Live API Key
    </p>

    <div className="mt-2 bg-gray-100 p-4 rounded text-black break-all">
      {partner.apiKey}
    </div>

    <button
      className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      onClick={() =>
        navigator.clipboard.writeText(
          partner.apiKey
        )
      }
    >
      Copy Live API Key
    </button>

  </div>

  <div className="mt-8 border-t pt-6">

  <p className="text-gray-600">
    Test API Key
  </p>

  <div className="mt-2 bg-gray-100 p-4 rounded text-black break-all">
    {partner.testApiKey || "Test API key not available"}
  </div>

  <button
    type="button"
    className="mt-4 bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700"
    onClick={async () => {
      if (!partner.testApiKey) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          partner.testApiKey
        );

        alert("Test API Key copied!");
      } catch (error) {
        console.error(
          "Failed copying test API key:",
          error
        );

        alert(
          "Unable to copy the Test API Key."
        );
      }
    }}
  >
    Copy Test API Key
  </button>

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