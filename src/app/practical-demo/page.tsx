"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PracticalDemoPage() {
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
              See Ask Michael in Practice
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-tight">
              From Engineering Problem
              <br />
              to Structured Technical Insight
            </h1>

            <p className="mt-7 max-w-3xl text-lg md:text-xl text-gray-400 leading-relaxed">
              An illustrative example of how Ask Michael can support an
              engineering investigation by structuring technical information,
              identifying relevant considerations and helping professionals
              evaluate possible next steps.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
              Illustrative engineering scenario — not a customer case study
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCENARIO */}
      <section className="relative py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">

          <div className="grid md:grid-cols-2 gap-14 items-start">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
                01 — Engineering Scenario
              </p>

              <h2 className="text-3xl md:text-5xl font-bold">
                Investigating distortion and cracking risk following a pot shell repair
              </h2>

              <p className="mt-6 text-gray-400 leading-relaxed">
                An engineering team is reviewing a repaired aluminium
                smelting pot shell where distortion has been observed after
                repair activity. The team needs to understand the factors
                that may contribute to the condition and determine what
                information should be reviewed before deciding on further
                action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-black p-7"
            >
              <h3 className="text-xl font-semibold">
                Engineering question
              </h3>

              <p className="mt-5 text-gray-300 leading-relaxed">
                “What factors should be considered when investigating
                distortion or cracking risk following a pot shell repair,
                and what information should be verified before determining
                the next engineering step?”
              </p>

              <div className="mt-7 border-t border-white/10 pt-6">
                <p className="text-sm text-gray-500">
                  The scenario is intentionally general and does not represent
                  a specific plant, customer, repair procedure or engineering
                  recommendation.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CONTEXT */}
      <section className="relative py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              02 — Technical Context
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              Bring the relevant information into the investigation
            </h2>

            <p className="mt-6 text-gray-400 leading-relaxed">
              The quality of technical analysis depends on the information
              available to the investigation. Ask Michael can provide a
              structured environment in which relevant engineering context
              can be considered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-14">

            {[
              {
                title: "Repair information",
                text: "Repair history, repair location, observed condition and available technical records.",
              },
              {
                title: "Engineering information",
                text: "Relevant drawings, specifications, procedures, standards or other technical documentation.",
              },
              {
                title: "Operational context",
                text: "Available information about operating conditions, inspection observations and the timing of the condition.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-7"
              >
                <div className="text-blue-400 text-sm font-semibold">
                  0{index + 1}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-400 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* ANALYSIS */}
      <section className="relative py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">

          <div className="grid md:grid-cols-2 gap-14 items-start">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
                03 — Ask Michael Analysis
              </p>

              <h2 className="text-3xl md:text-5xl font-bold">
                Structure the investigation around relevant considerations
              </h2>

              <p className="mt-6 text-gray-400 leading-relaxed">
                Rather than presenting a single unexplained answer, an
                engineering intelligence workflow can help organise the
                investigation into areas that require attention.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                "Review the location and nature of the observed distortion or cracking.",
                "Consider the repair configuration and available repair history.",
                "Identify information that may be relevant to thermal, mechanical or fabrication-related considerations.",
                "Compare available information against applicable engineering documentation and procedures.",
                "Identify gaps in the available information that should be investigated before drawing conclusions.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-black p-5"
                >
                  <div className="flex gap-4">
                    <span className="text-blue-400 font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-gray-300 leading-relaxed">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* DECISION SUPPORT */}
      <section className="relative py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              04 — Engineering Decision Support
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              Help the engineer determine what needs to happen next
            </h2>

            <p className="mt-6 text-gray-400 leading-relaxed">
              The objective is not to replace engineering judgement. The
              objective is to make the investigation more structured,
              transparent and informed.
            </p>
          </motion.div>

          <div className="mt-14 grid md:grid-cols-2 gap-6">

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
              <h3 className="text-xl font-semibold">
                Questions to investigate
              </h3>

              <ul className="mt-5 space-y-3 text-gray-400">
                <li>• What evidence is currently available?</li>
                <li>• What information is missing?</li>
                <li>• Which technical documents are relevant?</li>
                <li>• What inspection or measurement may be required?</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
              <h3 className="text-xl font-semibold">
                Information to verify
              </h3>

              <ul className="mt-5 space-y-3 text-gray-400">
                <li>• Applicable procedures and requirements</li>
                <li>• Repair records and engineering documentation</li>
                <li>• Observed physical conditions</li>
                <li>• Findings from qualified inspection or engineering personnel</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* HUMAN VERIFICATION */}
      <section className="relative py-24 bg-zinc-950 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
            05 — Verify &amp; Act
          </p>

          <h2 className="text-3xl md:text-5xl font-bold">
            Engineering judgement remains essential
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-gray-400 leading-relaxed">
            AI-generated information should be reviewed by appropriately
            qualified and authorised professionals before it is used to
            support engineering decisions, maintenance activities or
            operational work.
          </p>

          <div className="mt-10 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-7 text-left">
            <p className="text-gray-300 leading-relaxed">
              Ask Michael is an AI-assisted engineering intelligence platform.
              It is designed to support access to information, technical
              analysis and decision-support workflows. It does not replace
              applicable standards, procedures, engineering approval,
              inspection requirements or the judgement of qualified
              professionals.
            </p>
          </div>

        </div>
      </section>

      {/* ENTERPRISE TAKEAWAY */}
      <section className="relative py-28 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <p className="text-sm uppercase tracking-[0.2em] text-blue-400 mb-5">
            The Ask Michael Approach
          </p>

          <h2 className="text-3xl md:text-6xl font-bold">
            An intelligence layer around engineering knowledge
          </h2>

          <p className="mt-7 max-w-3xl mx-auto text-lg text-gray-400 leading-relaxed">
            The same workflow can be adapted around an organisation's
            engineering information, technical documentation and operational
            processes — creating a more accessible way for professionals to
            work with the knowledge already within their environment.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/partners-page"
              className="rounded-xl bg-white px-7 py-4 font-semibold text-black transition hover:bg-gray-200"
            >
              Explore Partnership
            </Link>

            <Link
              href="/enterprise"
              className="rounded-xl border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Explore Enterprise
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}