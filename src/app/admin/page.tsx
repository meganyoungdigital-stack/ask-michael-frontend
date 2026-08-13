"use client";


import {useEffect} from "react";
import {useRouter} from "next/navigation";


export default function AdminPage(){


const router=useRouter();



useEffect(() => {

  async function checkAdminSession() {

    try {

      const response = await fetch(
        "/api/admin/session"
      );

      if (!response.ok) {

        router.push(
          "/admin-login"
        );

      }

    } catch (error) {

      console.error(
        "Admin session check failed:",
        error
      );

      router.push(
        "/admin-login"
      );

    }

  }

  checkAdminSession();

}, [router]);


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