"use client";

import { useState } from "react";

export default function PartnersPage() {

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    website: "",
    message: "",
  });


  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setSubmitted(false);


    if (
      !formData.companyName ||
      !formData.contactName ||
      !formData.email ||
      !formData.message
    ) {

      alert(
        "Please complete all required fields."
      );

      return;

    }


    setLoading(true);


    try {

      console.log(
        "Sending partner application:",
        formData
      );


      const response = await fetch(
        "/api/partners/apply",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );



      const result = await response.json();



      console.log(
        "API response:",
        result
      );



      if (!response.ok) {

        throw new Error(
          result.error ||
          "Submission failed"
        );

      }



      setSubmitted(true);



      setFormData({

        companyName: "",
        contactName: "",
        email: "",
        website: "",
        message: "",

      });



    } catch (error) {


      console.error(
        "Partner application error:",
        error
      );


      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );


    } finally {


      setLoading(false);


    }

  }



  return (

    <main className="min-h-screen bg-white px-6 py-20">


      <section className="mx-auto max-w-5xl text-center">


        <h1 className="text-5xl font-bold">
          Partner With Ask Michael AI
        </h1>


        <p className="mt-6 text-xl text-gray-600">
          Integrate powerful AI capabilities into your software,
          website, or application through our partnership program.
        </p>


      </section>




      <section className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">


        <div className="rounded-xl border p-6">

          <h2 className="text-xl font-semibold">
            AI Integration
          </h2>

          <p className="mt-3 text-gray-600">
            Add intelligent assistants, automation,
            and AI features to your platform.
          </p>

        </div>



        <div className="rounded-xl border p-6">

          <h2 className="text-xl font-semibold">
            Revenue Sharing
          </h2>

          <p className="mt-3 text-gray-600">
            Create new revenue opportunities
            with AI-powered services.
          </p>

        </div>



        <div className="rounded-xl border p-6">

          <h2 className="text-xl font-semibold">
            Dedicated Support
          </h2>

          <p className="mt-3 text-gray-600">
            Work directly with our team
            during integration.
          </p>

        </div>


      </section>





      <section className="mx-auto mt-20 max-w-xl">


        <h2 className="mb-6 text-3xl font-bold text-center">
          Apply For Partnership
        </h2>



        {submitted && (

          <p className="mb-4 text-center text-green-600">
            Application submitted successfully.
            We will contact you soon.
          </p>

        )}




        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >



          <input
  type="text"
  required
  className="w-full rounded border p-3 text-black placeholder:text-gray-400"
  placeholder="Company Name"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({
                ...formData,
                companyName: e.target.value,
              })
            }
          />




          <input
            type="text"
            required
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
            placeholder="Your Name"
            value={formData.contactName}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactName: e.target.value,
              })
            }
          />




          <input
            type="email"
            required
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />




          <input
  type="text"
  className="w-full rounded border p-3 text-black placeholder:text-gray-400"
  placeholder="Website"
            value={formData.website}
            onChange={(e) =>
              setFormData({
                ...formData,
                website: e.target.value,
              })
            }
          />




          <textarea
  required
  className="w-full rounded border p-3 text-black placeholder:text-gray-400"
  placeholder="Tell us about your software and AI needs"

            value={formData.message}

            onChange={(e) =>
              setFormData({
                ...formData,
                message: e.target.value,
              })
            }

          />




          <button

            type="submit"

            disabled={loading}

            className="w-full rounded bg-black p-3 text-white disabled:opacity-50"

          >

            {loading
              ? "Submitting..."
              : "Submit Application"
            }

          </button>



        </form>


      </section>


    </main>

  );

}