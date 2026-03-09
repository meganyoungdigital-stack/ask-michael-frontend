import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AppPage() {

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-6">
          Ask Michael AI
        </h1>

        <p className="text-gray-300 mb-10">
          Welcome {user.firstName || "Engineer"}.
          You are now inside the Ask Michael AI platform.
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-2">
              Start Conversation
            </h2>
            <p className="text-gray-400">
              Ask technical questions about industrial systems,
              procedures, maintenance and engineering knowledge.
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-2">
              Knowledge Engineering
            </h2>
            <p className="text-gray-400">
              Structure engineering documentation and operational
              knowledge for AI-assisted insights.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}