"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { translations } from "@/lib/translations";
export default function LandingPage() {
  const [lang, setLang] = useState("en");

useEffect(() => {
  if (typeof window === "undefined") return;

  const loadLang = () => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
  };

  loadLang();

  window.addEventListener("languageChange", loadLang);

  return () => {
    window.removeEventListener("languageChange", loadLang);
  };
}, []);

const t = translations[lang as "en" | "zu" | "af" | "fr"];
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

        if (star.y > canvas.height) star.y = 0;

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

      <section className="relative h-screen w-full overflow-hidden pt-20">

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

        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-bold tracking-wider"
          >
            ASK MICHAEL
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-xl text-gray-200 max-w-2xl"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10"
          >
            <Link href="/portal">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold hover:scale-105 transition">
                {t.enterPlatform}
              </button>
            </Link>
          </motion.div>

        </div>

      </section>
<section className="relative py-24 bg-black text-white mt-10">

  <div className="max-w-6xl mx-auto px-6 text-center">

    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-bold mb-16"
    >
      {t.howItWorks}
    </motion.h2>

    <div className="grid md:grid-cols-3 gap-10">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10 hover:scale-105 transition"
      >
        <h3 className="text-2xl font-semibold mb-4">1. Upload Data</h3>
        <p className="text-gray-400">
          Import engineering documents, inspection reports, or operational data directly into the platform.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10 hover:scale-105 transition"
      >
        <h3 className="text-2xl font-semibold mb-4">2. AI Processing</h3>
        <p className="text-gray-400">
          Ask Michael analyzes your data using advanced AI models tailored for heavy engineering environments.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        viewport={{ once: true }}
        className="p-8 bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10 hover:scale-105 transition"
      >
        <h3 className="text-2xl font-semibold mb-4">3. Get Insights</h3>
        <p className="text-gray-400">
          Receive actionable insights, predictions, and recommendations to improve operations and safety.
        </p>
      </motion.div>

    </div>

  </div>

</section>
      <Footer />

    </main>
  );
}