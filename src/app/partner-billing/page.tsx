"use client";

import { useRouter } from "next/navigation";
export default function PartnerBilling(){

    const router = useRouter();

return (

<main className="min-h-screen bg-gray-50 pt-40 px-10">


<div className="flex items-center gap-3">

<button
onClick={() =>
router.push("/partner-dashboard")
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
Payment Details
</h2>


<div className="mt-5 space-y-4">


<input
className="w-full border rounded p-3 text-black"
placeholder="Card Holder Name"
/>


<input
className="w-full border rounded p-3 text-black"
placeholder="Billing Email"
/>


<input
className="w-full border rounded p-3 text-black"
placeholder="Company VAT Number"
/>


<input
className="w-full border rounded p-3 text-black"
placeholder="Billing Address"
/>


<button
className="bg-blue-600 text-white px-5 py-3 rounded"
>
Save Billing Details
</button>


</div>


</div>



<div className="bg-white rounded-xl p-6 shadow">


<h2 className="text-xl font-bold text-gray-900">
Subscription
</h2>


<p className="mt-4 text-gray-700">
Plan: Partner Subscription
</p>


<p className="text-gray-700">
Monthly Fee: R1999
</p>


<p className="text-gray-700">
Status: Active
</p>


<button
className="mt-6 bg-red-600 text-white px-5 py-3 rounded"
>
Cancel Subscription
</button>


</div>


</div>


</main>

);

}