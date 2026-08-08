"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function PartnerRegisterPage() {


  const params = useParams();

  const router = useRouter();


  const token =
  typeof params.token === "string"
    ? params.token
    : "";



  const [password,setPassword] =
    useState("");

  const [confirmPassword,setConfirmPassword] =
    useState("");

  const [loading,setLoading] =
    useState(false);

  const [message,setMessage] =
    useState("");




  async function handleSubmit(
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
          "/api/partner/register",
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
          "Registration failed"
        );

      }




      setMessage(
        "Account created successfully. Redirecting..."
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
        : "Registration failed"
      );


    }finally{

      setLoading(false);

    }


  }





return (

  <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Partner Account
      </h1>


      <form onSubmit={handleSubmit} className="space-y-4">


        <input

          type="password"

          placeholder="Create Password"

          className="w-full border rounded p-3 text-black"

          value={password}

          onChange={(e)=>
            setPassword(e.target.value)
          }

        />



        <input

          type="password"

          placeholder="Confirm Password"

          className="w-full border rounded p-3 text-black"

          value={confirmPassword}

          onChange={(e)=>
            setConfirmPassword(e.target.value)
          }

        />



        <button

          type="submit"

          disabled={loading}

          className="w-full bg-black text-white rounded p-3"

        >

          {
            loading
            ?
            "Creating Account..."
            :
            "Create Account"
          }

        </button>



        {
          message &&

          <p className="text-gray-700 mt-4">
            {message}
          </p>

        }


      </form>


    </div>


  </main>

);


}