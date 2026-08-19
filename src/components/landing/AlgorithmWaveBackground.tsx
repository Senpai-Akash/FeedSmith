"use client";

import { useEffect, useRef } from "react";

export default function AlgorithmWaveBackground() {
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
      ctx.strokeStyle = "rgba(0,71,171,0.2)";
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
      // animate points
      points.forEach(p => {
        p.x += (Math.random() - 0.5) * 0.005;
        p.y += (Math.random() - 0.5) * 0.005;
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
