
"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-500, 500], [6, -6]);
  const rotateY = useTransform(mouseX, [-500, 500], [-6, 6]);

  const { scrollYProgress } = useScroll();
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2,
      speed: Math.random() * 0.4,
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.y += star.speed;

        if (star.y > canvas.height) {
          star.y = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  return (
    <main className="relative w-full overflow-x-hidden bg-black text-white">

      {/* HERO */}
      <section className="relative min-h-[100dvh] md:h-screen w-full overflow-hidden pt-20">

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 opacity-40"
        />

        <motion.div
          style={{ rotateX, rotateY, scale: scrollScale }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 40, repeat: Infinity }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/hero-bg.png')",
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center text-center px-5 py-12 md:h-full md:min-h-0 md:px-6 md:py-0">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-sm md:text-base uppercase tracking-[0.3em] text-blue-300"
          >
            Industrial Engineering Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-wider"
          >
            ASK MICHAEL
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl"
          >
            AI-powered engineering intelligence for aluminium smelting
            and heavy industrial environments.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl"
          >
            Turn engineering knowledge, technical information and
            operational data into accessible intelligence for the people
            who need it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/portal">
              <button className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold hover:scale-105 transition">
                Explore Ask Michael →
              </button>
            </Link>

            <Link href="/partners-page">
              <button className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full border border-white/30 bg-black/30 backdrop-blur text-lg font-semibold hover:bg-white/10 transition">
                Partner With Us
              </button>
            </Link>
          </motion.div>

        </div>
      </section>


      {/* POSITIONING */}
      <section className="relative py-28 bg-black">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              More Than a Chat Interface
            </p>

            <h2 className="text-4xl md:text-6xl font-bold">
              An Engineering Intelligence Layer
            </h2>

            <p className="mt-8 max-w-3xl mx-auto text-lg text-gray-400 leading-relaxed">
              Ask Michael is designed to make specialised engineering
              knowledge easier to access, analyse and apply. The platform
              combines AI with engineering-focused information and
              workflows to support professionals working in demanding
              industrial environments.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/10 bg-zinc-900/60"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Engineering Knowledge
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Access engineering-focused AI assistance across aluminium
                smelting, heavy metal engineering and industrial
                maintenance environments.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/10 bg-zinc-900/60"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Organisational Knowledge
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Bring relevant technical documents and organisation-specific
                knowledge into workflows where AI assistance can help
                professionals find and interpret information.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/10 bg-zinc-900/60"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Integration Ready
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Connect engineering intelligence with software, services
                and technology ecosystems through the Ask Michael partner
                API.
              </p>
            </motion.div>

          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="relative py-28 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              From Information to Intelligence
            </p>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              How Ask Michael Works
            </h2>

            <p className="max-w-2xl mx-auto text-gray-400 text-lg">
              A structured approach to making specialised engineering
              information more accessible and useful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 mt-16">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10"
            >
              <div className="text-blue-400 text-sm font-semibold mb-4">
                01
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Connect Information
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Work with engineering questions, technical information,
                documents and operational context relevant to the problem
                being investigated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              viewport={{ once: true }}
              className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10"
            >
              <div className="text-blue-400 text-sm font-semibold mb-4">
                02
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Apply AI Analysis
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Ask Michael processes engineering-focused questions using
                AI to help structure information, identify relevant
                considerations and support technical analysis.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10"
            >
              <div className="text-blue-400 text-sm font-semibold mb-4">
                03
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Support Decisions
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Receive structured engineering information that can help
                professionals investigate issues, evaluate options and
                plan next steps.
              </p>
            </motion.div>

          </div>
        </div>
            </section>


      {/* ENGINEERING INTELLIGENCE IN PRACTICE */}
      <section className="relative py-28 bg-black">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              Engineering Intelligence in Practice
            </p>

            <h2 className="text-4xl md:text-6xl font-bold">
              From Engineering Question to Insight
            </h2>

            <p className="mt-6 max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
              Ask Michael is designed to fit into the way engineering
              professionals investigate problems, work with technical
              information and evaluate possible next steps.
            </p>
          </motion.div>


          <div className="relative mt-16">

            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-white/10" />

            <div className="grid md:grid-cols-4 gap-8">

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/30 bg-zinc-950 text-blue-400 text-lg font-semibold">
                  01
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Ask
                </h3>

                <p className="mt-3 text-gray-400 leading-relaxed">
                  An engineer presents a technical question, problem or
                  investigation that requires further understanding.
                </p>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/30 bg-zinc-950 text-blue-400 text-lg font-semibold">
                  02
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Contextualise
                </h3>

                <p className="mt-3 text-gray-400 leading-relaxed">
                  Relevant engineering information, documentation and
                  operational context can be brought into the workflow.
                </p>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/30 bg-zinc-950 text-blue-400 text-lg font-semibold">
                  03
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Analyse
                </h3>

                <p className="mt-3 text-gray-400 leading-relaxed">
                  Ask Michael uses AI to structure information, identify
                  relevant considerations and support technical analysis.
                </p>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-400/30 bg-zinc-950 text-blue-400 text-lg font-semibold">
                  04
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Verify &amp; Act
                </h3>

                <p className="mt-3 text-gray-400 leading-relaxed">
                  Qualified professionals review the information and apply
                  engineering judgement, procedures and applicable
                  requirements.
                </p>
              </motion.div>

            </div>

          </div>

        </div>
      </section>


      {/* INDUSTRIAL USE CASES */}
      <section className="relative py-28 bg-black">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              Industrial Applications
            </p>

            <h2 className="text-4xl md:text-6xl font-bold">
              Built Around Engineering Problems
            </h2>

            <p className="mt-6 max-w-3xl mx-auto text-gray-400 text-lg">
              Ask Michael is focused on practical engineering environments
              where specialised information, experience and technical
              judgement matter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16">

            <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/50">
              <h3 className="text-2xl font-semibold mb-3">
                Aluminium Smelting
              </h3>

              <p className="text-gray-400">
                Engineering assistance for aluminium smelting environments,
                maintenance questions and heavy industrial operations.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/50">
              <h3 className="text-2xl font-semibold mb-3">
                Maintenance & Repair
              </h3>

              <p className="text-gray-400">
                Support engineering teams when investigating maintenance,
                repair and technical problems.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/50">
              <h3 className="text-2xl font-semibold mb-3">
                Technical Documentation
              </h3>

              <p className="text-gray-400">
                Make relevant technical information easier to access and
                work with through AI-assisted document intelligence.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/50">
              <h3 className="text-2xl font-semibold mb-3">
                Engineering Workflows
              </h3>

              <p className="text-gray-400">
                Explore opportunities to incorporate engineering AI into
                existing software, services and industrial workflows.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* PARTNERSHIP CTA */}
      <section className="relative py-28 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-zinc-900/70 p-10 md:p-16"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
              Technology Partnerships
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Build With Ask Michael
            </h2>

            <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg leading-relaxed">
              Technology companies, engineering organisations and
              industrial partners can explore opportunities to integrate
              Ask Michael into products, services and engineering
              workflows.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

              <Link href="/partners-page">
                <button className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:scale-105 transition">
                  Partner With Ask Michael
                </button>
              </Link>

              <Link href="/contact">
                <button className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition">
                  Contact Our Team
                </button>
              </Link>

            </div>
          </motion.div>

        </div>
      </section>


      {/* INTRO VIDEO */}
      <section className="relative py-28 bg-black">

        <div className="text-center px-6 mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-5">
            See Ask Michael in Action
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">
            Platform Introduction
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-6"
        >
          <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">

            <iframe
              src="https://player.vimeo.com/video/1191117842?badge=0&autopause=0"
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title="Ask Michael AI Platform Introduction"
            />

          </div>
        </motion.div>

      </section>


      {/* RESPONSIBLE AI NOTICE */}
      <section className="relative py-20 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <p className="text-sm text-gray-500 leading-relaxed">
            Ask Michael provides AI-assisted engineering information and
            analysis. Outputs should be reviewed by appropriately qualified
            professionals and should not be treated as a substitute for
            engineering judgement, site procedures, applicable standards or
            safety requirements.
          </p>

        </div>
      </section>

      <Footer />
    </main>
  );
}

