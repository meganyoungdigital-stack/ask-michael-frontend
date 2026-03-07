"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function AIOrb() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-500, 500], [15, -15]);
  const rotateY = useTransform(mouseX, [-500, 500], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      className="relative flex items-center justify-center"
    >
      {/* Outer glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"
      />

      {/* Energy ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 rounded-full border border-blue-400/30"
      />

      {/* Core orb */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 40px #3b82f6",
            "0 0 80px #6366f1",
            "0 0 40px #3b82f6",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-600"
      />
    </motion.div>
  );
}