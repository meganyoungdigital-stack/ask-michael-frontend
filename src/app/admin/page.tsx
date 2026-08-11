"use client";


import {useEffect} from "react";
import {useRouter} from "next/navigation";


export default function AdminPage(){


const router=useRouter();



useEffect(()=>{


const token =
localStorage.getItem(
"adminToken"
);



if(!token){

router.push(
"/admin-login"
);

}


},[]);



return(

<main className="p-10 pt-40">

<h1 className="text-4xl font-bold text-gray-900">

Admin Dashboard

</h1>


<p className="mt-4 text-gray-700">

Welcome Admin

</p>


</main>

);


}