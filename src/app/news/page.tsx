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
          <Card className="p-6 rounded-2xl shadow">

            <CardContent>

              <div className="flex items-center justify-between gap-4 mb-4">

                <span className="text-sm text-blue-500 font-medium">
                  Platform Update
                </span>

                <span className="text-sm text-muted-foreground">
                  Coming Soon
                </span>

              </div>

              <h2 className="text-2xl font-semibold mb-3">
                Ask Michael News & Updates
              </h2>

              <p className="text-muted-foreground">
                News, announcements, new features, platform improvements,
                and other updates from Ask Michael will appear here.
              </p>

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