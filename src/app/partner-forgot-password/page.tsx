"use client";

import { useState } from "react";
import Link from "next/link";


export default function PartnerForgotPasswordPage() {


const [email, setEmail] = useState("");

const [message, setMessage] = useState("");

const [loading, setLoading] = useState(false);





async function handleSubmit(
e: React.FormEvent
) {


e.preventDefault();


setLoading(true);

setMessage("");



try {


const response = await fetch(
"/api/partner/forgot-password",
{

method:"POST",

headers:{
"Content-Type":
"application/json",
},

body:JSON.stringify({
email,
}),

}
);



const data =
await response.json();




if(!response.ok){


throw new Error(
data.error ||
"Request failed"
);


}




setMessage(
"Password reset link has been sent. Please check your email."
);



}
catch(error){


setMessage(

error instanceof Error
? error.message
: "Something went wrong"

);


}
finally{


setLoading(false);


}


}





return (

<main className="min-h-screen bg-gray-50 pt-40 px-6">


<div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">


<h1 className="text-3xl font-bold text-gray-900">

Forgot Password

</h1>



<p className="mt-3 text-gray-600">

Enter your partner account email and we will send you a reset link.

</p>




<form

onSubmit={handleSubmit}

className="mt-6 space-y-4"

>



<input

className="w-full border rounded p-3 text-black"

type="email"

placeholder="Partner email"

value={email}

onChange={(e)=>
setEmail(e.target.value)
}

required

/>




<button

disabled={loading}

className="w-full bg-blue-600 text-white rounded p-3 hover:bg-blue-700"

>

{

loading

?

"Sending..."

:

"Send Reset Link"

}

</button>




</form>





{
message && (

<p className="mt-5 text-gray-700">

{message}

</p>

)
}





<Link

href="/partner-login"

className="block mt-6 text-blue-600 hover:underline"

>

← Back to Partner Login

</Link>




</div>


</main>

);


}