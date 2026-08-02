export default function PartnersPage() {
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


        <form className="space-y-4">


          <input
            className="w-full rounded border p-3"
            placeholder="Company Name"
          />


          <input
            className="w-full rounded border p-3"
            placeholder="Your Name"
          />


          <input
            className="w-full rounded border p-3"
            placeholder="Email"
          />


          <input
            className="w-full rounded border p-3"
            placeholder="Website"
          />


          <textarea
            className="w-full rounded border p-3"
            placeholder="Tell us about your software and AI needs"
          />


          <button
            className="w-full rounded bg-black p-3 text-white"
          >
            Submit Application
          </button>


        </form>

      </section>


    </main>
  );
}