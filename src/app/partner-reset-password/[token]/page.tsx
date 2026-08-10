"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function PartnerResetPasswordPage() {


const params = useParams();

const router = useRouter();


const token =
params.token as string;



const [password,setPassword] =
useState("");

const [confirmPassword,setConfirmPassword] =
useState("");

const [message,setMessage] =
useState("");

const [loading,setLoading] =
useState(false);





async function handleReset(
e: React.FormEvent
){

e.preventDefault();


if(password !== confirmPassword){

setMessage(
"Passwords do not match"
);

return;

}


setLoading(true);



try{


const response =
await fetch(
"/api/partner/reset-password",
{

method:"POST",

headers:{
"Content-Type":
"application/json",
},

body:JSON.stringify({

token,

password,

}),


}
);



const data =
await response.json();



if(!response.ok){

throw new Error(
data.error ||
"Password reset failed"
);

}



setMessage(
"Password updated successfully. Redirecting to login..."
);



setTimeout(()=>{

router.push(
"/partner-login"
);

},2000);




}catch(error){


setMessage(

error instanceof Error
? error.message
: "Reset failed"

);


}finally{

setLoading(false);

}


}





return (

<main className="min-h-screen bg-gray-50 pt-40 px-6">


<div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">


<h1 className="text-3xl font-bold text-gray-900">

Reset Partner Password

</h1>



<form
onSubmit={handleReset}
className="mt-6 space-y-4"
>


<input

className="w-full border rounded p-3 text-black"

type="password"

placeholder="New password"

value={password}

onChange={(e)=>
setPassword(e.target.value)
}

/>



<input

className="w-full border rounded p-3 text-black"

type="password"

placeholder="Confirm new password"

value={confirmPassword}

onChange={(e)=>
setConfirmPassword(e.target.value)
}

/>



<button

disabled={loading}

className="w-full bg-blue-600 text-white rounded p-3"

>

{
loading
?
"Updating..."
:
"Reset Password"
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



</div>


</main>

);


}