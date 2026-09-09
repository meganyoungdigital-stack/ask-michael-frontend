"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-20">

      {/* HERO */}
      <div className="max-w-4xl mx-auto text-center mb-20">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          News & Announcements
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Stay up to date with Ask Michael, including new features,
          platform updates, important announcements, and company news.
        </motion.p>

      </div>

            {/* NEWS LIST */}
      <div className="max-w-4xl mx-auto space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden rounded-2xl shadow">

            <div className="relative w-full aspect-video">
              <img
                src="/images/news/ask-michael-ai-heavy-industry.png"
                alt="Ask Michael AI supporting engineering intelligence in a heavy industrial environment"
                className="w-full h-full object-cover"
              />
            </div>

            <CardContent className="p-6">

              <div className="flex items-center justify-between gap-4 mb-4">

                <span className="text-sm text-blue-500 font-medium">
                  Platform Update
                </span>

                <span className="text-sm text-muted-foreground">
                  September 2026
                </span>

              </div>

              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Introducing Ask Michael AI: Bringing Artificial Intelligence
                to Heavy Metal Engineering
              </h2>

              <p className="text-muted-foreground mb-6">
                We are proud to introduce Ask Michael AI, an industrial
                artificial intelligence platform designed to bring engineering
                knowledge, procedures, and operational decision support into
                one intelligent environment.
              </p>

              <Link
                href="/news/introducing-ask-michael-ai"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition"
              >
                Read More
              </Link>

            </CardContent>

          </Card>
        </motion.div>

      </div>

      {/* FOOTER CTA */}
      <div className="max-w-4xl mx-auto text-center mt-20">

        <p className="text-muted-foreground mb-6">
          Explore the Ask Michael platform and discover how AI-assisted
          engineering intelligence can support your workflows.
        </p>

        <Link
          href="/portal"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition"
        >
          Enter Platform
        </Link>

      </div>

    </div>
  );
}