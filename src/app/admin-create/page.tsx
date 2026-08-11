"use client";

import { useState } from "react";


export default function AdminCreatePage() {


const [email,setEmail] = useState("");

const [password,setPassword] = useState("");

const [message,setMessage] = useState("");

const [loading,setLoading] = useState(false);



async function createAdmin(e:React.FormEvent){

e.preventDefault();

setLoading(true);



try{


const response =
await fetch(
"/api/admin/create",
{
method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify({

email,

password

})

}

);



const data =
await response.json();



if(!response.ok){

throw new Error(
data.error || "Admin creation failed"
);

}



setMessage(
"Admin account created successfully"
);



}catch(error){


setMessage(

error instanceof Error
?
error.message
:
"Error creating admin"

);


}finally{


setLoading(false);


}


}



return (

<main className="min-h-screen bg-gray-50 pt-40 px-6">


<div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">


<h1 className="text-3xl font-bold text-gray-900 mb-6">

Create Admin Account

</h1>



<form
onSubmit={createAdmin}
className="space-y-4"
>


<input

className="w-full border rounded p-3 text-black"

placeholder="Admin Email"

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



<button

disabled={loading}

className="w-full bg-black text-white rounded p-3"

>

{

loading

?

"Creating..."

:

"Create Admin"

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