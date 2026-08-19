"use client";

import { motion } from "framer-motion";
// Simple algorithmic wave background – lightweight canvas animation
import { useEffect, useRef } from "react";

function AlgorithmWaveBackground() {
  const canvasRef = useRef(null as HTMLCanvasElement | null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth * dpr;
      canvas.height = canvas.parentElement!.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const points: { x: number; y: number }[] = [];
    const pointCount = 30;
    for (let i = 0; i < pointCount; i++) {
      points.push({ x: Math.random(), y: Math.random() });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0,71,171,0.2)"; // accent with low opacity
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.2) {
            ctx.globalAlpha = 1 - dist / 0.2;
            ctx.beginPath();
            ctx.moveTo(points[i].x * canvas.width, points[i].y * canvas.height);
            ctx.lineTo(points[j].x * canvas.width, points[j].y * canvas.height);
            ctx.stroke();
          }
        }
      }
      // animate points gently
      points.forEach(p => {
        p.x += (Math.random() - 0.5) * 0.005;
        p.y += (Math.random() - 0.5) * 0.005;
        // wrap around edges
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
      });
      animationFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-accent">FeedSmith</div>
          <ul className="flex space-x-6 text-sm font-medium">
            <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-50">
        {/* Visual background – algorithmic wave */}
        <div className="absolute inset-0 pointer-events-none">
          <AlgorithmWaveBackground />
        </div>
        {/* Content overlay */}
        <div className="relative max-w-2xl text-center px-4 py-24 md:py-32 lg:py-40">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your feed should know what you want.
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Make the algorithm visible – shape your social media recommendations with intent.
          </motion.p>
          <motion.a
            href="#"
            className="inline-block bg-accent text-white px-6 py-3 rounded-md font-medium hover:bg-accent/90 transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.a>
        </div>
      </section>

      {/* Start of next section – placeholder to enable scrolling */}
      <section className="bg-white py-20" id="next-section">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shape your feed, your way</h2>
          <p className="text-gray-600 leading-relaxed">
            FeedSmith surfaces the signals that drive your timeline and lets you prioritize what truly matters.
          </p>
        </div>
      </section>
    </main>
  );
}