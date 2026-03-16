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
import { useParams } from "next/navigation";

export default function SitePage() {

  const params = useParams();
  const page = params?.page as string;

  /* =========================
     HOMEPAGE ANIMATION STATE
  ========================= */

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-500, 500], [6, -6]);
  const rotateY = useTransform(mouseX, [-500, 500], [-6, 6]);

  const { scrollYProgress } = useScroll();
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    if (page !== "home") return;

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

  }, [mouseX, mouseY, page]);

  /* =========================
     PAGE ROUTER
  ========================= */

  if (page === "pricing") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Pricing</h1>
        <p className="text-gray-400">
          Flexible pricing for industrial AI intelligence.
        </p>
      </main>
    );
  }

  if (page === "contact") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Contact</h1>
        <p className="text-gray-400">
          Reach out to the Ask Michael team.
        </p>
      </main>
    );
  }

  if (page === "solutions") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Solutions</h1>
        <p className="text-gray-400">
          AI solutions for engineering operations.
        </p>
      </main>
    );
  }

  if (page === "knowledge-engineering") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">AI Knowledge Engineering</h1>
      </main>
    );
  }

  if (page === "industrial-procedures") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Industrial Procedures</h1>
      </main>
    );
  }

  if (page === "maintenance-intelligence") {
    return (
      <main className="pt-32 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Maintenance Intelligence</h1>
      </main>
    );
  }

  /* =========================
     DEFAULT FALLBACK
  ========================= */

  return (
    <main className="pt-32 text-center text-white">
      <h1 className="text-4xl">Page Not Found</h1>
    </main>
  );
}