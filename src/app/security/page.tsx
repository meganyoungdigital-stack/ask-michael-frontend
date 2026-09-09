
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SecurityPage() {
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
              Security & Responsible Use
            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Trust, Access &
              <br />
              <span className="text-blue-500">
                Responsible Engineering AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ask Michael is designed with controlled access, account
              management and responsible AI use in mind as the platform
              develops for engineering and industrial environments.
            </p>
          </motion.div>

        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Security Starts With Controlled Access
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Ask Michael uses authentication and authorization controls to
            manage access to partner and administrative functionality.
            Different parts of the platform use different access mechanisms
            according to their role.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed mt-5">
            We are continuing to develop the platform's security and
            organisational capabilities as Ask Michael moves toward broader
            industrial and enterprise use.
          </p>

        </div>
      </section>

      {/* ACCESS CONTROLS */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">
              Current Controls
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold">
              Access Controls Built Into the Platform
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Partner API Authentication
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner API requests require an assigned API key.
                    Requests are authenticated before access to the partner
                    engineering endpoint is provided.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Partner Account Controls
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner API access is checked against the partner account
                    status and subscription status before requests are
                    processed.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Administrative Authorization
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Administrative partner-account operations require an
                    authenticated administrator session.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full rounded-2xl">
                <CardContent className="p-8">

                  <h3 className="text-xl font-semibold mb-4">
                    Sensitive Account Information
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    Partner password hashes are excluded from the account data
                    returned by the administrative account endpoint.
                  </p>

                </CardContent>
              </Card>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ACCOUNT GOVERNANCE */}
      <section className="px-6 py-24 bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto">

          <div className="max-w-3xl mb-14">

            <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4">
              Account Governance
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Controlled Partner Environments
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              Ask Michael's partner architecture provides account-level
              controls for managing access, subscriptions and usage.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">

              <p className="text-blue-400 text-sm font-semibold mb-4">
                ACCESS
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Account Status
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Partner accounts can be managed through active and inactive
                account states.
              </p>

            </div>

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">

              <p className="text-blue-400 text-sm font-semibold mb-4">
                SUBSCRIPTION
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Subscription Controls
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Partner API access includes a subscription-status check before
                engineering requests are processed.
              </p>

            </div>

            <div className="border border-white/10 rounded-2xl p-7 bg-white/5">

              <p className="text-blue-400 text-sm font-semibold mb-4">
                USAGE
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Usage Controls
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Partner message usage and configured limits are tracked at the
                account level.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* TERMS & ACCOUNTABILITY */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

          <Card className="rounded-2xl">
            <CardContent className="p-8">

              <p className="text-sm font-semibold tracking-[0.15em] text-blue-500 uppercase mb-4">
                Accountability
              </p>

              <h2 className="text-2xl font-semibold mb-5">
                Terms Acceptance
              </h2>

              <p className="text-muted-foreground leading-relaxed">
                Partner account records include terms acceptance information,
                including the accepted terms version and acceptance timestamp.
                This provides an account-level record of the terms associated
                with a partner relationship.
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-8">

              <p className="text-sm font-semibold tracking-[0.15em] text-blue-500 uppercase mb-4">
                Responsible AI
              </p>

              <h2 className="text-2xl font-semibold mb-5">
                Human Oversight
              </h2>

              <p className="text-muted-foreground leading-relaxed">
                Ask Michael provides AI-assisted engineering information.
                Outputs should be reviewed and validated by appropriately
                qualified professionals before being used for engineering,
                operational or compliance decisions.
              </p>

            </CardContent>
          </Card>

        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-500 uppercase mb-4">
            Transparency
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Building Toward Broader Enterprise Requirements
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-5">
            Ask Michael is an evolving technology platform. As the platform
            develops, additional organisational, security and integration
            capabilities may be introduced to support the requirements of
            larger customers and technology partners.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe it is better to clearly communicate what the platform
            currently provides than to make unsupported certification or
            compliance claims.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4">
            Enterprise & Technology Partnerships
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Talk to Us About Your Requirements
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            If your organisation has specific security, integration,
            governance or technical requirements, contact Ask Michael to
            discuss your environment and potential partnership.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link href="/contact">
              <Button size="lg" className="px-8">
                Contact Ask Michael
              </Button>
            </Link>

            <Link href="/partners-page">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white/20 text-white hover:bg-white/10"
              >
                Partnership Opportunities
              </Button>
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

