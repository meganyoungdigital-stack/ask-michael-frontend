"use client";

import { useEffect, useState } from "react";


type PartnerApplication = {

  _id: string;

  companyName: string;

  contactName: string;

  email: string;

  website?: string;

  message: string;

  status: string;

  createdAt: string;

};



export default function PartnersAdminPage() {


  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [updating, setUpdating] = useState("");
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadApplications() {

      try {

        const response = await fetch(
          "/api/admin/partners"
        );


        const data = await response.json();


        setApplications(data);


      } catch (error) {

        console.error(
          "Failed loading partners:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadApplications();


  }, []);





  if (loading) {

  return (

    <main className="min-h-screen pt-32 px-10 text-gray-900">

      <p>
        Loading partner applications...
      </p>

    </main>

  );


   
    

  }




async function updatePartnerStatus(
  id: string,
  status: string
) {

  try {

    setUpdating(id);


    await fetch(
      "/api/admin/partners",
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          status,
        }),

      }
    );


    setApplications((current) =>
      current.map((partner) =>
        partner._id === id
          ? {
              ...partner,
              status,
            }
          : partner
      )
    );


  } catch (error) {

    console.error(
      "Status update failed",
      error
    );

  } finally {

    setUpdating("");

  }

}
  return (

    <main className="min-h-screen bg-gray-50 pt-32 px-10 pb-10">


      <h1 className="text-4xl font-bold mb-8 text-gray-900">

        Partner Applications

      </h1>




      <div className="space-y-6">


        {applications.length === 0 && (

          <div className="bg-white rounded-xl border p-6 text-gray-900">

            No partner applications found.

          </div>

        )}




        {applications.map((partner) => (


          <div

            key={partner._id}

            className="bg-white rounded-xl border p-6"

          >


            <div className="flex justify-between">


              <div>


                <h2 className="text-xl font-bold text-gray-900">

                  {partner.companyName}

                </h2>


                <p className="text-gray-600">

                  {partner.contactName}

                </p>


                <p className="text-gray-600">

                  {partner.email}

                </p>


              </div>



              <span className="rounded bg-yellow-100 px-3 py-1 text-sm">

                {partner.status}

              </span>


            </div>





            <div className="mt-4">


              <p>

                <strong>Website:</strong>{" "}

                {partner.website || "Not provided"}

              </p>


              <p className="mt-2">

                <strong>Message:</strong>

              </p>


              <p className="text-gray-700">

  {partner.message}

</p>


<div className="mt-6 flex gap-4">


  <button
    onClick={() =>
      updatePartnerStatus(
        partner._id,
        "approved"
      )
    }
    disabled={updating === partner._id}
    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
  >

    {updating === partner._id
      ? "Updating..."
      : "Approve"
    }

  </button>




  <button
    onClick={() =>
      updatePartnerStatus(
        partner._id,
        "rejected"
      )
    }
    disabled={updating === partner._id}
    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
  >

    {updating === partner._id
      ? "Updating..."
      : "Reject"
    }

  </button>


</div>


            </div>




          </div>


        ))}


      </div>


    </main>

  );


}