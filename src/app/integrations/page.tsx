
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-5">
              API & Integration
            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Connect Engineering Intelligence
              <br />
              <span className="text-blue-500">
                to Your Technology
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Give your applications, platforms and engineering services
              access to Ask Michael through a partner API designed for
              AI-assisted engineering interactions.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

              <Link href="/partners-page">
                <Button size="lg" className="px-8">
                  Become a Partner
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="outline" size="lg" className="px-8">
                  Discuss Integration
                </Button>
              </Link>

            </div>
          </motion.div>

        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
            Engineering Intelligence Layer
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Extend Your Existing Technology With AI-Assisted Engineering
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ask Michael can provide an AI-assisted engineering capability
            alongside existing software, industrial platforms and technical
            services.
          </p>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-5">
            Instead of requiring users to leave the technology they already
            use, integration partners can explore ways to make engineering
            intelligence available within their own products and workflows.
          </p>

        </div>
      </section>

      {/* API CAPABILITIES */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">
              Partner API
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              Built for Controlled Partner Access
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto mt-5">
              The current partner API provides authenticated access to
              Ask Michael's engineering AI capabilities.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* CARD 1 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    API Key Authentication
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner requests are authenticated using a dedicated API
                    key. Requests can use standard Bearer authentication when
                    connecting to the partner endpoint.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            {/* CARD 2 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Engineering AI Requests
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Applications can submit engineering questions and receive
                    AI-generated responses through the partner API.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            {/* CARD 3 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Usage Tracking
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner API usage is tracked against the organisation's
                    account, including message usage and configured message
                    limits.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            {/* CARD 4 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Usage-Based Billing
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner accounts can be configured with included message
                    allowances and additional usage billing when configured
                    limits are exceeded.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

          </div>

        </div>
      </section>

      {/* REQUEST FLOW */}
      <section className="px-6 py-24 bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase mb-3">
              Simple Request Flow
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              From Application to Engineering Response
            </h2>

          </div>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
              <p className="text-blue-400 font-semibold text-sm mb-4">
                01
              </p>

              <h3 className="text-lg font-semibold mb-3">
                Authenticate
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Your application sends an authenticated request using its
                assigned partner API key.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
              <p className="text-blue-400 font-semibold text-sm mb-4">
                02
              </p>

              <h3 className="text-lg font-semibold mb-3">
                Submit
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Your application submits an engineering question through the
                partner endpoint.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
              <p className="text-blue-400 font-semibold text-sm mb-4">
                03
              </p>

              <h3 className="text-lg font-semibold mb-3">
                Generate
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Ask Michael processes the request and returns an AI-assisted
                engineering response.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
              <p className="text-blue-400 font-semibold text-sm mb-4">
                04
              </p>

              <h3 className="text-lg font-semibold mb-3">
                Track
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                The partner account records usage against its configured
                message allowance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* USE CASES */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">
              Integration Opportunities
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              Where Ask Michael Can Add Value
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <Card className="rounded-2xl h-full">
              <CardContent className="p-8">

                <h3 className="text-xl font-semibold mb-4">
                  Industrial Software
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  Explore AI-assisted engineering capabilities within
                  industrial and engineering software environments.
                </p>

              </CardContent>
            </Card>

            <Card className="rounded-2xl h-full">
              <CardContent className="p-8">

                <h3 className="text-xl font-semibold mb-4">
                  Engineering Services
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  Extend specialist engineering services with AI-assisted
                  access to technical information and engineering knowledge.
                </p>

              </CardContent>
            </Card>

            <Card className="rounded-2xl h-full">
              <CardContent className="p-8">

                <h3 className="text-xl font-semibold mb-4">
                  OEM & Technology Partners
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  Explore opportunities to incorporate Ask Michael into
                  products, platforms and technology solutions serving
                  industrial customers.
                </p>

              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* TECHNICAL EXAMPLE */}
      <section className="px-6 py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-10">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">
              Developer View
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              A Straightforward API Model
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto mt-5">
              Partner applications submit a message and receive a structured
              JSON response.
            </p>

          </div>

          <Card className="rounded-2xl overflow-hidden">
            <CardContent className="p-0">

              <div className="bg-neutral-950 text-gray-200 p-6 md:p-8 overflow-x-auto">
                <pre className="text-sm leading-relaxed">
{`POST /api/partner/chat

Authorization: Bearer YOUR_PARTNER_API_KEY
Content-Type: application/json

{
  "message": "Engineering question"
}

Response:

{
  "success": true,
  "response": "Ask Michael engineering response",
  "usage": {
    "messages": 1,
    "includedMessages": 2000,
    "billedExtraMessages": 0,
    "extraMessages": 0
  }
}`}
                </pre>
              </div>

            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Example structure only. Partners receive their own API credentials
            and account configuration.
          </p>

        </div>
      </section>

      {/* RESPONSIBLE USE */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">

          <Card className="rounded-2xl">
            <CardContent className="p-8 md:p-10">

              <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
                Responsible Engineering AI
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold mb-5">
                AI Assistance Within Professional Workflows
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-4">
                Ask Michael provides AI-assisted engineering information and
                analysis. It is intended to support professional workflows,
                not replace qualified engineering judgement or established
                review processes.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Partners and end users remain responsible for reviewing
                outputs, validating technical information and applying
                appropriate engineering, regulatory and organisational
                requirements.
              </p>

            </CardContent>
          </Card>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4">
            Work With Ask Michael
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Explore an Integration Partnership
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            If you build industrial technology, engineering software or
            specialist technical services, let's explore how Ask Michael could
            complement your existing offering.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link href="/partners-page">
              <Button size="lg" className="px-8">
                Become a Partner
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white/20 text-white hover:bg-white/10"
              >
                Contact Ask Michael
              </Button>
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}
