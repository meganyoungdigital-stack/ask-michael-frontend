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



<div className="mt-10 grid md:grid-cols-3 gap-6">


<div className="bg-white rounded-xl p-6">

<h2 className="text-gray-500">
Monthly Fee
</h2>

<p className="text-3xl text-black">
R{partner.monthlyFee}
</p>

</div>



<div className="bg-white rounded-xl p-6">

<h2 className="text-gray-500">
Messages Used
</h2>

<p className="text-3xl text-black">
{partner.messages}
</p>

</div>



<div className="bg-white rounded-xl p-6">

<h2 className="text-gray-500">
Current Bill
</h2>

<p className="text-3xl text-black">
R{partner.currentBill}
</p>

</div>


</div>


</main>

);


}