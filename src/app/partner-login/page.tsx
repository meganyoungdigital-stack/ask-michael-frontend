"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function PartnerLoginPage() {


const router = useRouter();


const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [acceptedTerms, setAcceptedTerms] = useState(false);

const [loading, setLoading] = useState(false);




async function handleLogin(
e: React.FormEvent
) {


e.preventDefault();


if (!acceptedTerms) {

  alert(
    "You must accept the Terms and Conditions before logging in."
  );

  return;

}


setLoading(true);



try {


const response = await fetch(
"/api/partner/login",
{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

email,

password,

}),

}
);



const data =
await response.json();




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


<main className="min-h-screen bg-gray-50 pt-40 px-6">


<div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">


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

required

/>





<input

className="w-full border rounded p-3 text-black"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

required

/>






<Link

href="/partner-forgot-password"

className="block text-sm text-blue-600 hover:underline"

>

Forgot Password?

</Link>

{/* TERMS AND CONDITIONS */}

<div className="flex items-start gap-3 pt-2">

  <input
    id="partnerTerms"
    type="checkbox"
    checked={acceptedTerms}
    onChange={(e) =>
      setAcceptedTerms(e.target.checked)
    }
    className="mt-1 h-4 w-4"
  />

  <label
    htmlFor="partnerTerms"
    className="text-sm text-gray-700"
  >
    I agree to the{" "}

    <Link
      href="/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline font-medium"
    >
      Terms and Conditions
    </Link>

  </label>

</div>



<button

type="submit"

disabled={loading || !acceptedTerms}

className="w-full bg-black text-white rounded p-3 hover:bg-gray-800 disabled:opacity-50"

>

{

loading

?

"Logging in..."

:

"Login"

}


</button>





</form>



</div>


</main>


);


}