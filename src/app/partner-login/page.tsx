"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function PartnerLoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  async function handleLogin(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);


    try {

      const response = await fetch(
        "/api/partner/login",
        {
          method: "POST",

          headers:{
            "Content-Type":"application/json",
          },

          body:JSON.stringify({
            email,
            password,
          }),

        }
      );


      const data = await response.json();


      if(!response.ok){

        throw new Error(
          data.error || "Login failed"
        );

      }


      localStorage.setItem(
  "partnerToken",
  data.token
);


window.dispatchEvent(
  new Event("partnerLogin")
);


router.push(
  "/partner-dashboard"
);

    } catch(error){

      alert(
        error instanceof Error
        ? error.message
        : "Login failed"
      );


    } finally {

      setLoading(false);

    }

  }



return (

<main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">


<div className="bg-white rounded-xl shadow p-8 w-full max-w-md">


<h1 className="text-3xl font-bold text-gray-900 mb-6">
Partner Login
</h1>


<form
onSubmit={handleLogin}
className="space-y-4"
>


<input

className="w-full border rounded p-3 text-black"

placeholder="Email"

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<input

className="w-full border rounded p-3 text-black"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>
<Link

href="/partner-forgot-password"

className="block text-sm text-blue-600 hover:underline"

>
Forgot Password?
</Link>

<Link
href="/partner-forgot-password"
className="text-sm text-blue-600 hover:underline"
>
Forgot Password?
</Link>



<button

disabled={loading}

className="w-full bg-black text-white rounded p-3"

>

{loading
?"Logging in..."
:"Login"
}

</button>


</form>


</div>


</main>

);

}