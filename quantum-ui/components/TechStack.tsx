"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Code2, Cpu, Zap, Palette, Box, Atom } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TechItem {
  title: string;
  desc: string;
  icon: React.ElementType;
  accent: string;
  tag: string;
}

const TECH_ITEMS: TechItem[] = [
  { title: "Next.js 15",      desc: "React Framework",          icon: Code2,    accent: "#00d4ff", tag: "FRAMEWORK"   },
  { title: "Groq API",        desc: "LPU Inference Engine",      icon: Cpu,      accent: "#f59e0b", tag: "AI ENGINE"   },
  { title: "GSAP 3",          desc: "Scroll & Motion",           icon: Zap,      accent: "#10b981", tag: "ANIMATION"   },
  { title: "Tailwind CSS 4",  desc: "Styling Protocol",          icon: Palette,  accent: "#7b2ff7", tag: "DESIGN"      },
  { title: "Smiles Drawer",   desc: "Molecule Renderer",         icon: Box,      accent: "#00aaff", tag: "CHEMISTRY"   },
  { title: "Quantum Sim",     desc: "Quantum Circuit Layer",     icon: Atom,     accent: "#e879f9", tag: "QUANTUM"     },
];

export default function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".tech-header",
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      }
    );
    gsap.fromTo(
      ".tech-card",
      { opacity: 0, scale: 0.85, y: 40, rotationY: -10 },
      {
        opacity: 1, scale: 1, y: 0, rotationY: 0,
        duration: 0.7, stagger: 0.1, ease: "back.out(1.6)",
        scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none none" },
      }
    );
  }, { scope: containerRef });

  return (
    <section id="tech-stack" className="section-container pb-32" ref={containerRef}>
      {/* Header */}
      <div className="tech-header opacity-0 text-center mb-16">
        <div className="section-label mx-auto" style={{ width: "fit-content" }}>
          <Atom size={10} />
          <span>Technology Foundation</span>
        </div>
        <h2 className="apple-heading text-5xl md:text-6xl mb-5" style={{ color: "var(--text)" }}>
          Powered <span className="text-gradient-quantum">By</span>
        </h2>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <p className="apple-subheading text-lg text-center" style={{ maxWidth: 672, textAlign: "center", width: "100%" }}>
            Built on a bleeding-edge foundation of modern web technologies and quantum simulation primitives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 px-2">
        {TECH_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="tech-card opacity-0 glass-panel border-glow-animated smooth-transition"
              style={{
                padding: "1.75rem 1.5rem",
                display: "flex", flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-6px) scale(1.02)";
                el.style.boxShadow = `0 0 40px ${item.accent}20, 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 ${item.accent}20`;
                el.style.borderColor = `${item.accent}50`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "none";
                el.style.boxShadow = "";
                el.style.borderColor = "";
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 80, height: 80,
                background: `radial-gradient(circle at top right, ${item.accent}12, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, ${item.accent}20, ${item.accent}08)`,
                border: `1px solid ${item.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem",
                boxShadow: `0 0 20px ${item.accent}15`,
              }}>
                <Icon size={22} style={{ color: item.accent }} />
              </div>

              {/* Tag */}
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.5rem",
                letterSpacing: "0.22em",
                color: item.accent,
                fontWeight: 600,
                marginBottom: "0.4rem",
                opacity: 0.8,
                textAlign: "center",
              }}>
                {item.tag}
              </div>

              <h4 style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.35rem",
                letterSpacing: "-0.02em",
              }}>
                {item.title}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer bar */}
      <div style={{
        marginTop: "5rem",
        padding: "1.5rem 2rem",
        borderRadius: 16,
        background: "var(--qb-glass)",
        border: "1px solid var(--qb-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
        backdropFilter: "blur(20px)",
      }}>
        {["TypeScript 5", "FastAPI", "PyTorch", "RDKit", "QM9 Dataset"].map((tech) => (
          <span key={tech} style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: "var(--text-muted)",
            padding: "0.4rem 0.9rem",
            borderRadius: 9999,
            background: "rgba(0,212,255,0.04)",
            border: "1px solid var(--qb-border)",
          }}>
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
