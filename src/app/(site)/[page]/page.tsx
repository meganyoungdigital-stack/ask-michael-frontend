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

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

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

        <motion.div
          animate={{ x: ["0%", "-10%", "0%"] }}
          transition={{ duration: 120, repeat: Infinity }}
          className="absolute inset-0 bg-[url('/mist.png')] bg-cover opacity-20"
        />

        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-blue-400 to-transparent blur-xl"
        />

        <motion.div
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-blue-400/20"
        />

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
            Enter the intelligence dimension.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10"
          >
            <Link href="/portal">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold hover:scale-105 transition">
                Enter Platform →
              </button>
            </Link>
          </motion.div>

        </div>

      </section>

      {/* Footer ONLY on homepage */}
      <Footer />

    </main>
  );
}