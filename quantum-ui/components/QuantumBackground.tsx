"use client";
// components/QuantumBackground.tsx
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

// Quantum Blue palette
const COLORS = ["#00d4ff", "#00aaff", "#0080ff", "#7b2ff7", "#38bdf8", "#00d4ff"];

export default function QuantumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const MAX_DIST = 160;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.008,
      }));
    };

    const hexToRgb = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const a = p.alpha * (0.55 + 0.45 * Math.sin(p.pulse));
        const { r, g, b } = hexToRgb(p.color);

        // Outer glow halo
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
        grd.addColorStop(0, `rgba(${r},${g},${b},${a * 0.8})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * 1.5, 1)})`;
        ctx.fill();
      });

      // Entanglement lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], bP = particles[j];
          const dx = bP.x - a.x, dy = bP.y - a.y;
          if (Math.abs(dx) < MAX_DIST && Math.abs(dy) < MAX_DIST) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
              const opacity = (1 - dist / MAX_DIST) * 0.22;
              const { r, g, b } = hexToRgb(a.color);
              const grad = ctx.createLinearGradient(a.x, a.y, bP.x, bP.y);
              grad.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
              const { r: r2, g: g2, b: b2 } = hexToRgb(bP.color);
              grad.addColorStop(1, `rgba(${r2},${g2},${b2},${opacity})`);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(bP.x, bP.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    const onResize = () => { resize(); initParticles(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.65,
      }}
    />
  );
}
