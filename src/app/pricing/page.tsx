export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto text-center">

        <h1 className="text-4xl font-bold mb-12">Pricing</h1>

        <div className="grid md:grid-cols-2 gap-10">

          <div className="border border-gray-700 p-10 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Standard</h2>
            <p className="text-gray-400 mb-6">Basic AI access</p>
            <p className="text-3xl font-bold">$29 / month</p>
          </div>

          <div className="border border-blue-500 p-10 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Enterprise</h2>
            <p className="text-gray-400 mb-6">
              Custom integrations and industrial AI support
            </p>
            <p className="text-3xl font-bold">Contact Us</p>
          </div>

        </div>

      </div>
    </main>
  );
}