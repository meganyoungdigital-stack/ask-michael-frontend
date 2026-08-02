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

      <main className="min-h-screen p-10">

        <p>
          Loading partner applications...
        </p>

      </main>

    );

  }





  return (

    <main className="min-h-screen bg-gray-50 p-10">


      <h1 className="text-4xl font-bold mb-8">

        Partner Applications

      </h1>




      <div className="space-y-6">


        {applications.length === 0 && (

          <div className="bg-white rounded-xl border p-6">

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


                <h2 className="text-xl font-bold">

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


            </div>




          </div>


        ))}


      </div>


    </main>

  );


}