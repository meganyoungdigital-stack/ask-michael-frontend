"use client";

import { useState } from "react";

export default function PartnersPage() {
  const [formData, setFormData] = useState({
  companyName: "",
  contactName: "",
  email: "",
  website: "",
  partnershipType: "",
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
  !formData.partnershipType ||
  !formData.message
) {
      alert("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/partner/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  companyName: formData.companyName,
  contactName: formData.contactName,
  email: formData.email,
  website: formData.website,
  message: `Partnership Type: ${formData.partnershipType}\n\n${formData.message}`,
}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSubmitted(true);

      setFormData({
  companyName: "",
  contactName: "",
  email: "",
  website: "",
  partnershipType: "",
  message: "",
});
    } catch (error) {
      console.error("Partner application error:", error);

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
    <main className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="border-b bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Strategic Technology Partnerships
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Partner With Ask Michael
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
            Bring AI-assisted engineering intelligence into the industrial
            technologies, software platforms and services your customers
            already use.
          </p>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500">
            Ask Michael is an engineering AI platform designed to help
            organisations access, understand and apply technical knowledge
            within their existing workflows.
          </p>

        </div>
      </section>


      {/* Partnership opportunities */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Partnership Opportunities
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Build with Ask Michael
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              We work with technology providers, engineering organisations
              and industrial solution companies to explore integration,
              commercial and joint-solution opportunities.
            </p>
          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-lg font-bold text-white">
                01
              </div>

              <h3 className="text-xl font-semibold">
                Technology Integration
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Integrate Ask Michael&apos;s engineering intelligence
                capabilities into industrial software, platforms or
                digital solutions.
              </p>
            </div>


            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-lg font-bold text-white">
                02
              </div>

              <h3 className="text-xl font-semibold">
                Engineering &amp; Industrial Services
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Provide engineering and technical teams with AI-assisted
                access to relevant knowledge, documentation and procedures.
              </p>
            </div>


            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-lg font-bold text-white">
                03
              </div>

              <h3 className="text-xl font-semibold">
                OEM &amp; Technology Partnerships
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Explore opportunities to combine Ask Michael&apos;s AI
                capabilities with industrial technologies, automation
                platforms and engineering systems.
              </p>
            </div>


            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-lg font-bold text-white">
                04
              </div>

              <h3 className="text-xl font-semibold">
                Channel &amp; Commercial Partnerships
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Work with Ask Michael to bring engineering intelligence
                capabilities to organisations and customers within your
                existing market.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Why partner */}
      <section className="border-y bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Why Ask Michael
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              More than an AI chatbot
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Ask Michael is being developed as an engineering intelligence
              layer that can work alongside existing industrial technology
              and engineering workflows.
            </p>
          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Engineering-focused
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Built around engineering knowledge, technical documentation,
                industrial procedures and operational workflows.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Your knowledge, your environment
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Organisations can work with their own relevant engineering
                information and knowledge within the platform.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Integration-ready
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Designed with partner access and integration possibilities
                in mind, allowing Ask Michael to become part of existing
                technology ecosystems.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Human-in-the-loop
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                AI is designed to assist professional users while keeping
                engineering judgement and verification with qualified
                people.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Extensible platform
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                The platform can be adapted to different engineering
                domains, organisations and operational environments.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Partnership-focused
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Partnership arrangements can be shaped around integration
                requirements, customer needs and the commercial opportunity.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Integration statement */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gray-900 px-8 py-14 text-center text-white sm:px-14">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            Built for Industrial Technology
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Add an AI engineering intelligence layer to your technology ecosystem.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Whether you are exploring API integration, a joint solution,
            OEM collaboration or a commercial partnership, we would like
            to understand what you are building.
          </p>

        </div>
      </section>


      {/* Application */}
      <section className="border-t px-6 py-20">
        <div className="mx-auto max-w-3xl">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Start a Conversation
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Explore a Partnership
            </h2>

            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-3 text-sm text-gray-500">
  <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
    Technology Integration
  </span>

  <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
    Engineering Services
  </span>

  <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
    OEM Partnerships
  </span>

  <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
    Commercial Partnerships
  </span>
</div>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              Tell us about your organisation, your technology and the
              opportunity you would like to explore with Ask Michael.
            </p>

          </div>


          {submitted && (
            <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-5 text-center text-green-800">
              <p className="font-semibold">
                Application submitted successfully.
              </p>

              <p className="mt-1 text-sm">
                Thank you. We will review your application and contact you soon.
              </p>
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5"
          >

<div className="border-b border-gray-200 pb-3">
  <h3 className="text-lg font-semibold text-gray-900">
    Organisation Details
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    Tell us who you are and how we can contact you.
  </p>
</div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Name *
              </label>

              <input
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="Your company"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyName: e.target.value,
                  })
                }
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Name *
              </label>

              <input
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="Your name"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactName: e.target.value,
                  })
                }
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Business Email *
              </label>

              <input
                type="email"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Website
              </label>
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Partnership Type *
  </label>

  <select
    required
    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
    value={formData.partnershipType}
    onChange={(e) =>
      setFormData({
        ...formData,
        partnershipType: e.target.value,
      })
    }
  >
    <option value="">Select partnership type</option>
    <option value="Technology Integration">
      Technology Integration
    </option>
    <option value="Engineering & Industrial Services">
      Engineering &amp; Industrial Services
    </option>
    <option value="OEM & Technology Partnership">
      OEM &amp; Technology Partnership
    </option>
    <option value="Channel & Commercial Partnership">
      Channel &amp; Commercial Partnership
    </option>
    <option value="Other / Strategic Partnership">
      Other / Strategic Partnership
    </option>
  </select>
</div>

              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="https://www.yourcompany.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website: e.target.value,
                  })
                }
              />
            </div>
<div className="border-b border-gray-200 pb-3 pt-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Partnership Opportunity
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    Help us understand the technology, market or business opportunity you would like to explore.
  </p>
</div>

            <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Tell us about the opportunity *
  </label>

              <textarea
                required
                rows={7}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="For example: your technology or service, the customers or industries you serve, how you see Ask Michael fitting into your offering, and what you would like to explore together."
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Submitting Application..."
                : "Submit Partnership Application"}
            </button>

<p className="text-center text-xs leading-5 text-gray-500">
  By submitting this application, you agree that Ask Michael may use the
  information provided to evaluate and respond to your partnership enquiry.
  Please do not include confidential, proprietary or sensitive technical
  information in this form.
</p>

          </form>

        </div>
      </section>

    </main>
  );
}

