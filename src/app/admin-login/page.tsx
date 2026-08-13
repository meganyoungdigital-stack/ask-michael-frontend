"use client";


import {useState} from "react";
import {useRouter} from "next/navigation";


export default function AdminLoginPage(){


const router=useRouter();


const [email,setEmail]=useState("");

const [password,setPassword]=useState("");

const [loading,setLoading]=useState(false);



async function login(e:React.FormEvent){

e.preventDefault();


setLoading(true);



const response =
await fetch(
"/api/admin/login",
{

method:"POST",

headers:{
"Content-Type":"application/json"
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

alert(data.error);

setLoading(false);

return;

}

router.push(
"/admin/partners"
);



}



return(

<main className="min-h-screen bg-gray-50 pt-40 px-6">


<div className="max-w-md mx-auto bg-white p-8 rounded-xl">


<h1 className="text-3xl font-bold text-gray-900">

Admin Login

</h1>


<form
onSubmit={login}
className="space-y-4 mt-6"
>


<input

className="w-full border p-3 rounded text-black"

placeholder="Email"

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<input

className="w-full border p-3 rounded text-black"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<button

className="w-full bg-black text-white p-3 rounded"

disabled={loading}

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