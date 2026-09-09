
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EnterprisePage() {
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
              Enterprise Engineering Intelligence
            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              AI Engineering Intelligence
              <br />
              <span className="text-blue-500">Built Around Your Organisation</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ask Michael helps engineering and industrial organisations access,
              understand and apply technical knowledge through AI-assisted
              workflows.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link href="/contact">
                <Button size="lg" className="px-8">
                  Talk to Ask Michael
                </Button>
              </Link>

              <Link href="/partners-page">
                <Button variant="outline" size="lg" className="px-8">
                  Explore Partnerships
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold mb-6"
          >
            More Than a General-Purpose AI Assistant
          </motion.h2>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
            Ask Michael is being developed as an engineering intelligence
            platform focused on helping technical teams work with specialised
            engineering knowledge, documentation and operational information.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto mt-5">
            The goal is not to replace engineers or established engineering
            processes. It is to give professionals an AI-assisted layer that
            can help them find information, analyse technical material and
            support better-informed decisions.
          </p>

        </div>
      </section>

      {/* ENTERPRISE CAPABILITIES */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">
              Platform Capabilities
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              Designed for Technical Environments
            </h2>
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
                    Engineering Knowledge
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Access specialised engineering knowledge through an
                    AI-assisted interface designed around technical questions
                    and engineering workflows.
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
                    Organisation-Specific Knowledge
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Ask Michael can work with organisation-specific technical
                    documentation and knowledge, allowing AI-assisted responses
                    to be grounded in relevant materials.
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
                    Technical Document Intelligence
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Technical documents can become part of an AI-assisted
                    knowledge workflow, helping teams retrieve and work with
                    information more efficiently.
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
                    API & Integration Opportunities
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Organisations and technology partners can explore ways to
                    integrate Ask Michael capabilities into existing software,
                    services and engineering workflows.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            {/* CARD 5 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Multi-User Workflows
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Ask Michael supports organisational partner environments
                    where multiple authorised users can access AI-assisted
                    engineering capabilities.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            {/* CARD 6 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Human-in-the-Loop Engineering
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    AI-generated information is intended to support qualified
                    professionals rather than replace engineering judgement,
                    verification or established review processes.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ORGANISATIONAL KNOWLEDGE */}
      <section className="px-6 py-24 bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4">
              Your Knowledge. Your Workflows.
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Turn Technical Knowledge Into an Accessible AI Layer
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Engineering organisations often work with large volumes of
              technical documentation, procedures, standards and specialised
              knowledge.
            </p>

            <p className="text-gray-400 text-lg leading-relaxed">
              Ask Michael is designed to help make that information easier to
              access through natural-language interaction and AI-assisted
              retrieval.
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-white/5">

            <div className="space-y-6">

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  Knowledge
                </p>
                <p className="text-lg font-medium mt-1">
                  Engineering documents & technical information
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  Intelligence
                </p>
                <p className="text-lg font-medium mt-1">
                  AI-assisted retrieval & analysis
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  Workflow
                </p>
                <p className="text-lg font-medium mt-1">
                  Human review & engineering decision-making
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* INTEGRATION */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
            Integration
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Designed to Work Alongside Existing Technology
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ask Michael can be explored as an AI intelligence layer alongside
            existing engineering software, industrial technologies, data
            environments and technical services.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">

            <Card className="rounded-2xl">
              <CardContent className="p-7">
                <h3 className="font-semibold mb-3">
                  Technology Platforms
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore AI capabilities that complement existing engineering
                  and industrial technology platforms.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-7">
                <h3 className="font-semibold mb-3">
                  Engineering Services
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Add AI-assisted technical knowledge capabilities to
                  engineering and specialist services.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-7">
                <h3 className="font-semibold mb-3">
                  Industrial Solutions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore opportunities to incorporate engineering intelligence
                  into industrial solution environments.
                </p>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* RESPONSIBLE AI */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">

          <Card className="rounded-2xl">
            <CardContent className="p-8 md:p-10">

              <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
                Responsible Use
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold mb-5">
                AI-Assisted Does Not Mean Autonomous Engineering
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-4">
                Ask Michael is designed to assist professionals with access to
                technical information, analysis and engineering workflows.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Outputs should be reviewed and validated by appropriately
                qualified professionals. Users remain responsible for final
                engineering decisions, applicable standards, regulatory
                requirements and implementation.
              </p>

            </CardContent>
          </Card>

        </div>
      </section>

      {/* ENTERPRISE COLLABORATION */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
            Enterprise Collaboration
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Explore What Ask Michael Could Do for Your Organisation
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Every engineering organisation has different workflows, technical
            knowledge and technology environments. We are open to discussing
            integrations, partner solutions and tailored applications of
            Ask Michael.
          </p>

          <Link href="/contact">
            <Button size="lg" className="px-8">
              Talk to Ask Michael
            </Button>
          </Link>

        </div>
      </section>

    </main>
  );
}

