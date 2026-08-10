"use client";


import {useEffect,useState} from "react";


export default function PartnerDashboard(){


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

<main className="min-h-screen bg-gray-50 p-10">


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

R{partner.monthlyFee}

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



</div>





<div className="mt-8 bg-white rounded-xl p-6 shadow">


<h2 className="text-xl font-bold text-black">

API Access

</h2>


<p className="mt-4 text-gray-600">

Your API Key

</p>


<div className="mt-2 bg-gray-100 p-4 rounded text-black break-all">

{partner.apiKey}

</div>


<button

className="mt-4 bg-blue-600 text-white px-5 py-2 rounded"

onClick={()=>
navigator.clipboard.writeText(
partner.apiKey
)
}

>

Copy API Key

</button>


</div>






<div className="mt-8 bg-white rounded-xl p-6 shadow">


<h2 className="text-xl font-bold text-black">

Billing

</h2>


<p className="mt-4 text-gray-700">

Current Balance:

<strong>

 R{partner.currentBill}

</strong>

</p>


<p className="mt-2 text-gray-700">

Price per message:

<strong>

 R{partner.pricePerMessage}

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




<div className="mt-8 bg-white rounded-xl p-6 shadow">


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