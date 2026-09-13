"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Engineering Knowledge",
    description:
      "Access and work with engineering knowledge, technical references and structured information within an AI-assisted workflow.",
    items: [
      "Engineering standards and technical references",
      "Procedures and work instructions",
      "Engineering terminology and technical concepts",
      "Organisation-specific engineering knowledge",
    ],
  },
  {
    number: "02",
    title: "Technical Investigation",
    description:
      "Support engineering investigations by helping structure problems, identify relevant considerations and highlight information that may require further review.",
    items: [
      "Technical problem investigation",
      "Root-cause analysis support",
      "Maintenance and repair investigations",
      "Identification of information gaps",
    ],
  },
  {
    number: "03",
    title: "Document Intelligence",
    description:
      "Turn technical documentation into information that can be more accessible and useful within an engineering workflow.",
    items: [
      "Technical documents",
      "Engineering procedures",
      "Maintenance information",
      "Organisational technical records",
    ],
  },
  {
    number: "04",
    title: "Operational Decision Support",
    description:
      "Help engineering professionals evaluate technical information and possible next steps while keeping qualified human judgement at the centre of the process.",
    items: [
      "Engineering questions",
      "Maintenance workflows",
      "Technical decision support",
      "Structured review and verification",
    ],
  },
  {
    number: "05",
    title: "Engineering AI Workflows",
    description:
      "Bring engineering questions, technical context and AI-assisted analysis together in a workflow designed around real engineering problems.",
    items: [
      "Ask and contextualise",
      "Analyse technical information",
      "Identify relevant considerations",
      "Verify before action",
    ],
  },
  {
    number: "06",
    title: "Integration Ready",
    description:
      "Connect engineering intelligence with technology environments and partner workflows through the Ask Michael integration layer.",
    items: [
      "Partner API access",
      "Authenticated engineering requests",
      "Usage tracking",
      "Technology partnership opportunities",
    ],
  },
];

export default function CapabilitiesPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-black to-black" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              Ask Michael Capabilities
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-tight">
              Engineering Intelligence
              <br />
              Built Around Technical Work
            </h1>

            <p className="mt-7 max-w-3xl text-lg md:text-xl text-gray-400 leading-relaxed">
              Ask Michael is designed to help engineering professionals work
              with technical knowledge, documentation and operational context
              through an AI-assisted intelligence workflow.
            </p>

            <p className="mt-5 max-w-3xl text-sm md:text-base text-gray-500 leading-relaxed">
              Capabilities described on this page represent the platform's
              intended engineering intelligence workflows and should not be
              interpreted as a replacement for qualified engineering
              professionals, approved procedures or applicable requirements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CAPABILITY OVERVIEW */}
      <section className="relative py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              Core Capabilities
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              From engineering knowledge to decision support
            </h2>

            <p className="mt-6 text-gray-400 leading-relaxed">
              The platform brings several capabilities together so that
              engineering information can be investigated, structured and
              reviewed within a connected workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mt-14">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-black p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-blue-400">
                      {capability.number}
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold">
                      {capability.title}
                    </h3>
                  </div>

                  <div className="h-10 w-10 rounded-full border border-white/10 bg-zinc-950" />
                </div>

                <p className="mt-5 text-gray-400 leading-relaxed">
                  {capability.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {capability.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-gray-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGINEERING INTELLIGENCE LAYER */}
      <section className="relative py-28 bg-black">
        <div className="max-w-6xl mx-auto px-6">

          <div className="grid md:grid-cols-2 gap-14 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
                The Intelligence Layer
              </p>

              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Connect knowledge, analysis and engineering workflows
              </h2>

              <p className="mt-6 text-gray-400 leading-relaxed">
                Ask Michael is designed as an intelligence layer that can sit
                around existing engineering knowledge and workflows rather
                than requiring organisations to replace the systems and
                processes they already use.
              </p>

              <p className="mt-5 text-gray-400 leading-relaxed">
                This creates opportunities to connect technical knowledge,
                AI-assisted analysis and engineering decision-support
                processes in a way that can evolve with an organisation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/10 bg-zinc-950 p-8 md:p-10"
            >
              <div className="space-y-5">

                {[
                  "Engineering Knowledge",
                  "Technical Context",
                  "AI-Assisted Analysis",
                  "Human Verification",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-black px-5 py-4"
                  >
                    <span className="text-sm font-semibold text-blue-400">
                      0{index + 1}
                    </span>

                    <span className="text-gray-200">
                      {item}
                    </span>
                  </div>
                ))}

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* INDUSTRIAL FOCUS */}
      <section className="relative py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              Industrial Focus
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              Designed for engineering-intensive environments
            </h2>

            <p className="mt-6 text-gray-400 leading-relaxed">
              Ask Michael's initial focus is aluminium smelting and heavy
              industrial engineering, with workflows designed around the
              realities of technical information, maintenance, repair and
              operational decision support.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mt-14 text-left">

            {[
              "Aluminium Smelting",
              "Maintenance & Repair",
              "Technical Documentation",
              "Engineering Workflows",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-black p-6"
              >
                <p className="font-semibold text-white">
                  {item}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* RESPONSIBLE AI */}
      <section className="relative py-24 bg-black">
        <div className="max-w-5xl mx-auto px-6">

          <div className="rounded-3xl border border-blue-400/20 bg-blue-400/5 p-8 md:p-10">

            <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              Responsible Engineering AI
            </p>

            <h2 className="text-2xl md:text-4xl font-bold">
              AI assists the engineer — it does not replace engineering authority
            </h2>

            <p className="mt-5 text-gray-400 leading-relaxed">
              Ask Michael is intended to support engineering professionals
              with information access, technical analysis and structured
              decision-support workflows. Outputs should be reviewed and
              verified by appropriately qualified and authorised professionals
              before being used in operational or engineering decisions.
            </p>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-5">
            Explore Ask Michael
          </p>

          <h2 className="text-3xl md:text-6xl font-bold">
            Build engineering intelligence around your organisation
          </h2>

          <p className="mt-7 max-w-3xl mx-auto text-lg text-gray-400 leading-relaxed">
            Explore how Ask Michael can support engineering knowledge,
            technical workflows and technology partnerships.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/enterprise"
              className="rounded-xl bg-white px-7 py-4 font-semibold text-black transition hover:bg-gray-200"
            >
              Explore Enterprise
            </Link>

            <Link
              href="/partners-page"
              className="rounded-xl border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Partner With Ask Michael
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}